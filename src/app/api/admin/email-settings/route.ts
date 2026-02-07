import { NextResponse } from 'next/server';
import {
  getSanitizedEmailSettings,
  saveEmailSettings,
  EmailSettingsInput,
} from '@/lib/email-settings';
import { withSecurityContext } from '@/lib/security-context';

export const dynamic = 'force-dynamic';

export const GET = withSecurityContext(async ({ context }) => {
  const session = context.session;
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getSanitizedEmailSettings();

  return NextResponse.json({
    data: settings,
    envFallback: {
      smtpHost: Boolean(process.env.SMTP_HOST),
      smtpPort: Boolean(process.env.SMTP_PORT),
      smtpUser: Boolean(process.env.SMTP_USER),
      smtpPass: Boolean(process.env.SMTP_PASS),
      smtpFromName: Boolean(process.env.SMTP_FROM_NAME),
      smtpFromEmail: Boolean(process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER),
      notifyTo: Boolean(process.env.NOTIFY_EMAIL_TO),
    },
  });
});

export const PUT = withSecurityContext(async ({ req, context }) => {
  const session = context.session;
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const payload: EmailSettingsInput = {
    smtpHost: stringOrNull(body.smtpHost),
    smtpPort: parsePort(body.smtpPort),
    smtpUser: stringOrNull(body.smtpUser),
    fromName: stringOrNull(body.fromName),
    fromEmail: stringOrNull(body.fromEmail),
    notifyTo: stringOrNull(body.notifyTo),
    replyTo: stringOrNull(body.replyTo),
  };

  if (typeof body.smtpSecure === 'boolean') {
    payload.smtpSecure = body.smtpSecure;
  }

  if (body.resetPassword === true) {
    payload.smtpPass = null;
  } else if (typeof body.smtpPass === 'string' && body.smtpPass.trim().length > 0) {
    payload.smtpPass = body.smtpPass.trim();
  }

  try {
    await saveEmailSettings(payload, session.user.email || session.user.id);
    const settings = await getSanitizedEmailSettings();
    return NextResponse.json({ data: settings });
  } catch (error: any) {
    console.error('[EmailSettings] 保存失败', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save email settings' },
      { status: 400 }
    );
  }
});

function stringOrNull(value: any) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePort(value: any) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(Math.max(value, 1), 65535);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = parseInt(value.trim(), 10);
    if (!Number.isNaN(parsed)) {
      return Math.min(Math.max(parsed, 1), 65535);
    }
  }
  return null;
}
