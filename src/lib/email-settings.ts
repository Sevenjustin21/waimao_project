import { Prisma, prisma } from '@/lib/prisma';

const SETTINGS_ID = 1;

export interface EmailSettingsInput {
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean;
  smtpUser?: string | null;
  smtpPass?: string | null;
  fromName?: string | null;
  fromEmail?: string | null;
  notifyTo?: string | null;
  replyTo?: string | null;
}

export interface SanitizedEmailSettings {
  smtpHost: string;
  smtpPort: number | '';
  smtpSecure: boolean;
  smtpUser: string;
  fromName: string;
  fromEmail: string;
  notifyTo: string;
  replyTo: string;
  hasPassword: boolean;
  updatedAt?: string;
  updatedBy?: string | null;
}

export interface ResolvedEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  notifyTo: string;
  replyTo?: string;
}

function normalizeSmtpHost(host?: string | null) {
  return (host || '').trim().toLowerCase();
}

function isLocalSmtpHost(host?: string | null) {
  const normalizedHost = normalizeSmtpHost(host);
  return normalizedHost === 'localhost' || normalizedHost === '127.0.0.1';
}

function isLocalMailOverrideEnabled() {
  return process.env.SMTP_FORCE_ENV === 'true';
}

export function shouldUseSmtpAuth(config: Pick<ResolvedEmailConfig, 'host'>) {
  return !isLocalSmtpHost(config.host);
}

function handleLookupError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
    console.warn('[EmailSettings] 表缺失，请运行 `npx prisma db push` 同步最新结构');
    return null;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.warn('[EmailSettings] 无法连接数据库，已回退至环境变量配置', error.message);
    return null;
  }

  console.error('[EmailSettings] 查询失败，已回退至环境变量', error);
  return null;
}

export async function getEmailSettingsRecord() {
  try {
    return await prisma.emailSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
  } catch (error) {
    return handleLookupError(error);
  }
}

export async function getSanitizedEmailSettings(): Promise<SanitizedEmailSettings | null> {
  const record = await getEmailSettingsRecord();
  if (!record) {
    return null;
  }

  return {
    smtpHost: record.smtpHost || '',
    smtpPort: record.smtpPort ?? '',
    smtpSecure: Boolean(record.smtpSecure),
    smtpUser: record.smtpUser || '',
    fromName: record.fromName || '',
    fromEmail: record.fromEmail || '',
    notifyTo: record.notifyTo || '',
    replyTo: record.replyTo || '',
    hasPassword: Boolean(record.smtpPass),
    updatedAt: record.updatedAt?.toISOString(),
    updatedBy: record.updatedBy,
  };
}

export async function saveEmailSettings(input: EmailSettingsInput, updatedBy?: string) {
  const data: Record<string, any> = {
    updatedBy: updatedBy || null,
  };

  if (input.smtpHost !== undefined) data.smtpHost = nullable(input.smtpHost);
  if (input.smtpPort !== undefined)
    data.smtpPort = typeof input.smtpPort === 'number' ? input.smtpPort : null;
  if (input.smtpSecure !== undefined) data.smtpSecure = input.smtpSecure;
  if (input.smtpUser !== undefined) data.smtpUser = nullable(input.smtpUser);
  if (input.fromName !== undefined) data.fromName = nullable(input.fromName);
  if (input.fromEmail !== undefined) data.fromEmail = nullable(input.fromEmail);
  if (input.notifyTo !== undefined) data.notifyTo = nullable(input.notifyTo);
  if (input.replyTo !== undefined) data.replyTo = nullable(input.replyTo);
  if (input.smtpPass !== undefined) data.smtpPass = nullable(input.smtpPass);

  try {
    const record = await prisma.emailSettings.upsert({
      where: { id: SETTINGS_ID },
      update: data,
      create: {
        id: SETTINGS_ID,
        ...data,
      },
    });
    return record;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      throw new Error('EmailSettings 数据表不存在，请执行 `npx prisma db push` 后重试。');
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new Error('数据库无法连接，无法保存邮件配置。请确认 Postgres 服务已运行。');
    }
    throw error;
  }
}

export async function getResolvedEmailConfig(): Promise<ResolvedEmailConfig | null> {
  const record = await getEmailSettingsRecord();
  return resolveEmailConfig(record);
}

export function resolveEmailConfig(record?: Awaited<ReturnType<typeof getEmailSettingsRecord>>): ResolvedEmailConfig | null {
  const envPort = parseInt(process.env.SMTP_PORT || '', 10);
  const envSecureOverride = process.env.SMTP_SECURE;
  const preferEnv = isLocalMailOverrideEnabled();

  const envHost = process.env.SMTP_HOST || '';
  const envUser = process.env.SMTP_USER || '';
  const envPass = process.env.SMTP_PASS || '';
  const envFromName = process.env.SMTP_FROM_NAME || 'Waimao System';
  const envFromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '';
  const envNotifyTo = process.env.NOTIFY_EMAIL_TO || '';
  const envReplyTo = process.env.SMTP_REPLY_TO || undefined;

  const host = preferEnv ? envHost || record?.smtpHost || '' : record?.smtpHost || envHost || '';
  const port = preferEnv
    ? (Number.isFinite(envPort) ? envPort : record?.smtpPort || 587)
    : record?.smtpPort || (Number.isFinite(envPort) ? envPort : 587);
  const user = preferEnv ? envUser || record?.smtpUser || '' : record?.smtpUser || envUser || '';
  const pass = preferEnv ? envPass || record?.smtpPass || '' : record?.smtpPass || envPass || '';
  const fromName = preferEnv
    ? envFromName || record?.fromName || 'Waimao System'
    : record?.fromName || envFromName || 'Waimao System';
  const fromEmail = preferEnv
    ? envFromEmail || record?.fromEmail || envUser || ''
    : record?.fromEmail || envFromEmail || envUser || '';
  const notifyTo = preferEnv
    ? envNotifyTo || record?.notifyTo || ''
    : record?.notifyTo || envNotifyTo || '';
  const replyTo = preferEnv
    ? envReplyTo || record?.replyTo || undefined
    : record?.replyTo || envReplyTo || undefined;
  const secure = preferEnv
    ? envSecureOverride === 'true'
      ? true
      : envSecureOverride === 'false'
        ? false
        : port === 465
    : typeof record?.smtpSecure === 'boolean'
      ? record.smtpSecure
      : envSecureOverride === 'true'
        ? true
        : envSecureOverride === 'false'
          ? false
          : port === 465;

  if (!host || !user || !pass || !fromEmail || !notifyTo) {
    return null;
  }

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromName,
    fromEmail,
    notifyTo,
    replyTo,
  };
}

function nullable(value?: string | null) {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
