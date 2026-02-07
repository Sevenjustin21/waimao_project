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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Admin Console</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">邮件服务器配置</h1>
        <p className="text-sm text-gray-500 mt-2">
          这里的配置将覆盖 .env 中的 SMTP/通知邮箱参数，可直接在后台完成修改与测试。
        </p>
      </div>

      <EmailSettingsForm initialSettings={settings} envHints={envHints} />
    </div>
  );
}
