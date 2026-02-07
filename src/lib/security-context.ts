import 'server-only';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { attachRequestId, getOrCreateRequestId } from './request-id';
import { logRequest, logger } from './logger';

type RouteParams = Record<string, string | string[]>;

export interface SecurityActor {
  type: 'admin' | 'user' | 'anonymous';
  id?: string | null;
  email?: string | null;
}

export interface AuditStub {
  log: (event: string, data?: Record<string, unknown>) => void;
}

export interface RateLimitStub {
  check: (bucket?: string, key?: string) => Promise<void>;
}

export interface SecurityContext {
  requestId: string;
  ip: string;
  actor: SecurityActor;
  session: Session | null;
  audit: AuditStub;
  rateLimit: RateLimitStub;
}

type WrappedHandler = (args: {
  req: NextRequest;
  params?: RouteParams;
  context: SecurityContext;
}) => Promise<NextResponse> | NextResponse;

interface RouteContext {
  params?: RouteParams;
}

export function withSecurityContext(handler: WrappedHandler) {
  return async (req: NextRequest, routeContext: RouteContext = {}) => {
    const start = Date.now();
    const requestId = getOrCreateRequestId(req);
    const session = await resolveSession(req);
    const actor = resolveActor(session);
    const ip = resolveIp(req);

    const context: SecurityContext = {
      requestId,
      ip,
      actor,
      session,
      audit: createAuditStub(requestId, actor),
      rateLimit: createRateLimitStub(requestId),
    };

    let response: NextResponse;
    try {
      response = await handler({
        req,
        params: routeContext?.params,
        context,
      });
    } catch (error: any) {
      logger.error('handler.error', {
        requestId,
        message: error?.message ?? 'Unknown handler error',
      });
      throw error;
    }

    if (!response) {
      response = NextResponse.next();
    }

    attachRequestId(response, requestId);
    logRequest({
      requestId,
      method: req.method,
      path: req.nextUrl.pathname,
      status: response.status,
      durationMs: Date.now() - start,
      actorType: actor.type,
      ip,
    });

    return response;
  };
}

async function resolveSession(req: NextRequest): Promise<Session | null> {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      return session;
    }
  } catch (error: any) {
    logger.warn('session.fetch_failed', { message: error?.message });
  }

  try {
    const token = await getToken({
      req,
      secret: authOptions.secret || process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return null;
    }
    return {
      user: {
        id: typeof token.id === 'string' ? token.id : undefined,
        email: token.email ?? undefined,
        name: token.name ?? undefined,
        role: (token as any).role,
        vipTitle: (token as any).vipTitle ?? null,
      } as Session['user'],
      expires: token.exp
        ? new Date(Number(token.exp) * 1000).toISOString()
        : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    } as Session;
  } catch (error: any) {
    logger.warn('session.token_failed', { message: error?.message });
  }

  return null;
}

function resolveActor(session: Session | null): SecurityActor {
  if (!session || !session.user) {
    return { type: 'anonymous' };
  }

  const role = session.user.role === 'ADMIN' ? 'admin' : 'user';
  return {
    type: role,
    id: session.user.id,
    email: session.user.email,
  };
}

function resolveIp(req: NextRequest): string {
  if (req.ip) {
    return req.ip;
  }
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const [first] = forwarded.split(',');
    if (first && first.trim().length > 0) {
      return first.trim();
    }
  }
  return 'unknown';
}

function createAuditStub(requestId: string, actor: SecurityActor): AuditStub {
  return {
    log(event, data) {
      logger.info(`audit.${event}`, {
        requestId,
        actorType: actor.type,
        actorId: actor.id,
        ...(data ?? {}),
      });
    },
  };
}

function createRateLimitStub(requestId: string): RateLimitStub {
  return {
    async check(bucket?: string, key?: string) {
      logger.debug('rateLimit.stub', {
        requestId,
        bucket: bucket ?? 'default',
        key: key ?? 'n/a',
      });
    },
  };
}
