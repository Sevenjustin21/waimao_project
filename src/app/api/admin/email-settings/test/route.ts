import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getResolvedEmailConfig } from '@/lib/email-settings';
import { withSecurityContext } from '@/lib/security-context';

export const dynamic = 'force-dynamic';

export const POST = withSecurityContext(async ({ req, context }) => {
  const session = context.session;
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await getResolvedEmailConfig();
  if (!config) {
    return NextResponse.json(
      { error: '邮件服务器未配置，请先在后台填写或提供 .env 值' },
      { status: 400 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // ignore empty body
  }

  const recipient =
    typeof body?.to === 'string' && body.to.includes('@')
      ? body.to
      : config.notifyTo;

  if (!recipient) {
    return NextResponse.json({ error: '缺少可发送的收件人地址' }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: recipient,
      replyTo: config.replyTo || config.fromEmail,
      subject: `WAIMO SMTP 测试 (${new Date().toLocaleString()})`,
      text: `Test email triggered by ${session.user.email || session.user.id}`,
      html: `<p>Triggered by: <strong>${session.user.email || session.user.id}</strong></p>
             <p>时间：${new Date().toLocaleString()}</p>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return NextResponse.json({
      ok: true,
      messageId: info.messageId,
      envelope: info.envelope,
      accepted: info.accepted,
      rejected: info.rejected,
      previewUrl,
    });
  } catch (error: any) {
    console.error('[EmailSettings/Test] 发送失败', error);
    return NextResponse.json(
      { error: error?.message || '发送测试邮件失败' },
      { status: 500 }
    );
  }
});
