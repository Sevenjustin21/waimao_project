import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getResolvedEmailConfig, shouldUseSmtpAuth } from '@/lib/email-settings';
import { withSecurityContext } from '@/lib/security-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withSecurityContext(async ({ req }) => {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const company = typeof body?.company === 'string' ? body.company.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
  }

  const emailConfig = await getResolvedEmailConfig();
  if (!emailConfig) {
    return NextResponse.json({ error: 'Email service is not configured, message cannot be sent.' }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: shouldUseSmtpAuth(emailConfig)
        ? {
            user: emailConfig.user,
            pass: emailConfig.pass,
          }
        : undefined,
      connectionTimeout: 15000,
      socketTimeout: 15000,
      greetingTimeout: 15000,
    });

    await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: emailConfig.notifyTo,
      replyTo: email,
      subject: `[WAIMO Contact] ${name}`,
      text: `From: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\n\n${message}`,
      html: `
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });
  } catch (error: any) {
    console.error('[contact] send mail failed', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send message.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
});
