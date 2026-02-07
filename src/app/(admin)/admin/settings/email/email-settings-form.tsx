"use client";

import { useMemo, useState } from 'react';
import type { SanitizedEmailSettings } from '@/lib/email-settings';

interface Props {
  initialSettings: SanitizedEmailSettings | null;
  envHints: Record<string, boolean>;
}

type Status =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

export default function EmailSettingsForm({ initialSettings, envHints }: Props) {
  const [formData, setFormData] = useState({
    smtpHost: initialSettings?.smtpHost || '',
    smtpPort: initialSettings?.smtpPort?.toString() || '',
    smtpSecure: initialSettings?.smtpSecure ?? false,
    smtpUser: initialSettings?.smtpUser || '',
    smtpPass: '',
    fromName: initialSettings?.fromName || '',
    fromEmail: initialSettings?.fromEmail || '',
    notifyTo: initialSettings?.notifyTo || '',
    replyTo: initialSettings?.replyTo || '',
  });

  const [hasPassword, setHasPassword] = useState(initialSettings?.hasPassword ?? false);
  const [clearPassword, setClearPassword] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [lastUpdated, setLastUpdated] = useState(initialSettings?.updatedAt || null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState(initialSettings?.updatedBy || null);

  const envItems = useMemo(
    () => [
      { label: 'SMTP_HOST', enabled: envHints.smtpHost },
      { label: 'SMTP_PORT', enabled: envHints.smtpPort },
      { label: 'SMTP_USER', enabled: envHints.smtpUser },
      { label: 'SMTP_PASS', enabled: envHints.smtpPass },
      { label: 'SMTP_FROM_NAME', enabled: envHints.smtpFromName },
      { label: 'SMTP_FROM_EMAIL / SMTP_USER', enabled: envHints.smtpFromEmail },
      { label: 'NOTIFY_EMAIL_TO', enabled: envHints.notifyTo },
    ],
    [envHints]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload: Record<string, any> = {
      ...formData,
      smtpSecure: Boolean(formData.smtpSecure),
    };

    if (formData.smtpPort) {
      payload.smtpPort = formData.smtpPort;
    }

    if (clearPassword) {
      payload.resetPassword = true;
    } else if (formData.smtpPass.trim().length > 0) {
      payload.smtpPass = formData.smtpPass.trim();
    }

    try {
      const res = await fetch('/api/admin/email-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || '保存失败');
      }

      setStatus({ type: 'success', message: '配置已保存。' });
      setHasPassword(Boolean(json?.data?.hasPassword));
      setClearPassword(false);
      setFormData((prev) => ({ ...prev, smtpPass: '' }));
      setLastUpdated(json?.data?.updatedAt || null);
      setLastUpdatedBy(json?.data?.updatedBy || null);
    } catch (error: any) {
      setStatus({ type: 'error', message: error?.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/email-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRecipient ? { to: testRecipient } : {}),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || '测试邮件发送失败');
      }
      const previewInfo = json?.previewUrl ? ` 预览：${json.previewUrl}` : '';
      setStatus({
        type: 'success',
        message: `测试邮件已发送 (Message ID: ${json.messageId || '未知'}).${previewInfo}`,
      });
    } catch (error: any) {
      setStatus({ type: 'error', message: error?.message || '测试失败' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
            <input
              type="text"
              name="smtpHost"
              value={formData.smtpHost}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              placeholder="smtp.example.com"
              required={!envHints.smtpHost}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
            <input
              type="number"
              name="smtpPort"
              value={formData.smtpPort}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              placeholder="587"
              min={1}
              max={65535}
              required={!envHints.smtpPort}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">SMTP User</label>
            <input
              type="text"
              name="smtpUser"
              value={formData.smtpUser}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              placeholder="no-reply@example.com"
              required={!envHints.smtpUser}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>SMTP Password</span>
              {hasPassword && !clearPassword && (
                <span className="text-xs text-green-600">已保存</span>
              )}
            </label>
            <input
              type="password"
              name="smtpPass"
              value={formData.smtpPass}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              placeholder={hasPassword && !clearPassword ? '••••••••' : '输入新密码'}
            />
            {hasPassword && !clearPassword && (
              <button
                type="button"
                onClick={() => setClearPassword(true)}
                className="mt-2 text-xs text-red-500 hover:underline"
              >
                清除已保存密码
              </button>
            )}
            {clearPassword && (
              <div className="mt-2 text-xs text-yellow-600">
                保存后将清除密码。
                <button
                  type="button"
                  className="ml-2 text-blue-600 hover:underline"
                  onClick={() => setClearPassword(false)}
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="smtpSecure"
            name="smtpSecure"
            type="checkbox"
            checked={formData.smtpSecure}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <label htmlFor="smtpSecure" className="text-sm text-gray-700">
            启用 SSL (465端口通常需要开启)
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Name</label>
            <input
              type="text"
              name="fromName"
              value={formData.fromName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              placeholder="WAIMO System"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">From Email</label>
            <input
              type="email"
              name="fromEmail"
              value={formData.fromEmail}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              placeholder="rfq@example.com"
              required={!envHints.smtpFromEmail}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">通知收件人 (可逗号分隔)</label>
            <textarea
              name="notifyTo"
              value={formData.notifyTo}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              placeholder="ops@example.com,sales@example.com"
              required={!envHints.notifyTo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reply-To (可选)</label>
            <input
              type="email"
              name="replyTo"
              value={formData.replyTo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              placeholder="sales@example.com"
            />
          </div>
        </div>

        {status && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {status.message}
          </div>
        )}

        {lastUpdated && (
          <div className="text-xs text-gray-400">
            最近更新：{new Date(lastUpdated).toLocaleString()}
            {lastUpdatedBy && ` · 操作人：${lastUpdatedBy}`}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="测试收件人（可选）"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-sm"
            />
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {testing ? '发送中...' : '发送测试邮件'}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-slate-300 p-4 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">环境变量回退</h3>
          <p className="text-xs text-slate-500 mt-1">
            如果数据库中未填写对应字段，将自动读取下列环境变量：
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-600">
            {envItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${
                    item.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span>{item.label}</span>
                {item.enabled ? (
                  <span className="text-green-600">(已提供)</span>
                ) : (
                  <span className="text-gray-400">(未提供)</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700">使用提示</h3>
          <ul className="mt-2 list-disc pl-5 text-xs text-slate-500 space-y-1">
            <li>SMTP 密码留空表示沿用当前密码。</li>
            <li>多个通知邮箱可用逗号或分号分隔。</li>
            <li>需要先执行 <code className="font-mono bg-slate-100 px-1">npx prisma db push</code> 以创建 email_settings 表。</li>
            <li>测试邮件会使用以上配置实时发送，可用于验证收发。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
