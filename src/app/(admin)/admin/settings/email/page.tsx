import { Metadata } from 'next';
import { getSanitizedEmailSettings } from '@/lib/email-settings';
import EmailSettingsForm from './email-settings-form';

export const metadata: Metadata = {
  title: 'Email Settings - Admin | WAIMO',
  description: 'Configure SMTP server and RFQ notification targets.',
  robots: 'noindex, nofollow',
};

export const dynamic = 'force-dynamic';

export default async function EmailSettingsPage() {
  const settings = await getSanitizedEmailSettings();
  const envHints = {
    smtpHost: Boolean(process.env.SMTP_HOST),
    smtpPort: Boolean(process.env.SMTP_PORT),
    smtpUser: Boolean(process.env.SMTP_USER),
    smtpPass: Boolean(process.env.SMTP_PASS),
    smtpFromName: Boolean(process.env.SMTP_FROM_NAME),
    smtpFromEmail: Boolean(process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER),
    notifyTo: Boolean(process.env.NOTIFY_EMAIL_TO),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.5em] text-blue-200">Admin Console</p>
        <h1 className="text-3xl font-semibold text-white">邮件服务器配置</h1>
        <p className="text-sm text-white/70">
          这里的配置会覆盖 .env 中的 SMTP / 通知邮箱参数，可在后台直接保存并发送测试邮件。
        </p>
      </div>

      <EmailSettingsForm initialSettings={settings} envHints={envHints} />
    </div>
  );
}
