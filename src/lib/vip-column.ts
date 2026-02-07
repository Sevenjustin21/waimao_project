import { Prisma } from '@prisma/client';

let vipColumnAvailable: boolean | null = null;

function isVipColumnError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const code = (error as Prisma.PrismaClientKnownRequestError).code;
  const message = (error as Error).message;
  if (code && ['P2022', 'P2010', 'P2003'].includes(code)) {
    return message?.includes('vipTitle') ?? false;
  }
  return typeof message === 'string' && message.includes('vipTitle');
}

function markVipColumnMissing() {
  if (vipColumnAvailable !== false) {
    console.warn(
      '[VIP] 检测到 app_users.vipTitle 列不存在，已禁用 VIP 头衔能力。请执行 `npx prisma migrate deploy` 同步数据库。'
    );
  }
  vipColumnAvailable = false;
}

export function isVipColumnEnabled() {
  return vipColumnAvailable !== false;
}

export async function runWithVipColumn<T>(
  resolver: (includeVipColumn: boolean) => Promise<T>
): Promise<T> {
  if (vipColumnAvailable === false) {
    return resolver(false);
  }
  try {
    const result = await resolver(true);
    vipColumnAvailable = true;
    return result;
  } catch (error) {
    if (isVipColumnError(error)) {
      markVipColumnMissing();
      return resolver(false);
    }
    throw error;
  }
}

export function handleVipColumnWriteError(error: unknown) {
  if (isVipColumnError(error)) {
    markVipColumnMissing();
    return true;
  }
  return false;
}
