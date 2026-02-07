import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import { authOptions } from '@/lib/auth';
import { directus } from '@/lib/directus';
import { createItem, createItems } from '@directus/sdk';
import { createRateLimiter } from '@/lib/rate-limit';
import { getResolvedEmailConfig } from '@/lib/email-settings';

const ipBurstLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  identifier: 'rfq:ip:burst',
});

const ipDailyLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 200,
  identifier: 'rfq:ip:daily',
});

const emailLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  identifier: 'rfq:email',
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ITEMS = 20;

function getClientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMultiline(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, '<br />');
}

async function sendNotification(inquiry: any, items: any[]) {
  const emailConfig = await getResolvedEmailConfig();
  if (!emailConfig) {
    console.warn('[RFQ] 邮件配置缺失，已跳过通知');
    return;
  }

  const recipients = emailConfig.notifyTo
    .split(/[,;\n]/)
    .map((addr) => addr.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    console.warn('[RFQ] 没有可用的通知收件人，已跳过通知');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
    connectionTimeout: 5000,
    socketTimeout: 5000,
  });

  const safeName = escapeHtml(inquiry.customer_name || 'Unknown');
  const safeEmail = escapeHtml(inquiry.email || 'N/A');
  const safeCompany = escapeHtml(inquiry.company || 'N/A');
  const safeCountry = escapeHtml(inquiry.country || 'N/A');
  const safeMessage = inquiry.message ? formatMultiline(inquiry.message) : 'No message';

  const sanitizedItems =
    items && items.length > 0
      ? items.map((item: any) => ({
          product: escapeHtml(item.product_id || 'N/A'),
          quantity: escapeHtml(String(item.quantity ?? '')),
          remark: escapeHtml(item.remark || ''),
        }))
      : [];

  const itemsHtml =
    sanitizedItems.length > 0
      ? sanitizedItems
          .map(
            (item: any) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.product}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.remark}</td>
      </tr>
    `,
          )
          .join('')
      : '<tr><td colspan="3" style="border: 1px solid #ddd; padding: 8px;">No items</td></tr>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New RFQ Received</h2>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p><strong>Inquiry ID:</strong> ${escapeHtml(inquiry.id || '')}</p>
        <p><strong>Customer:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Company:</strong> ${safeCompany}</p>
        <p><strong>Country:</strong> ${safeCountry}</p>
        <p><strong>Date:</strong> ${escapeHtml(new Date().toLocaleString())}</p>
      </div>
      
      <h3 style="color: #333;">Message</h3>
      <div style="padding: 10px; border-left: 4px solid #ddd; margin-bottom: 20px;">
        ${safeMessage}
      </div>
      
      <h3 style="color: #333;">Items</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product ID</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Remark</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
    to: recipients,
    replyTo: emailConfig.replyTo || emailConfig.fromEmail,
    subject: `[New Inquiry] ${safeName} - ${safeCompany}`,
    html,
  });
}

export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  const ip = getClientIp(req);
  console.log(`[RFQ] Request ${requestId} received`);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad Request', message: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const website = typeof body.website === 'string' ? body.website.trim() : '';
    if (website) {
      console.warn(`[RFQ] Honeypot triggered for request ${requestId}`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const customer_name = typeof body.customer_name === 'string' ? body.customer_name.trim() : '';
    if (!customer_name || customer_name.length < 2 || customer_name.length > 80) {
      return NextResponse.json({ error: 'Bad Request', message: 'Invalid customer_name (2-80 chars)' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Bad Request', message: 'Invalid email format' }, { status: 400 });
    }

    const company = typeof body.company === 'string' ? body.company.trim() : '';
    if (company.length > 100) {
      return NextResponse.json({ error: 'Bad Request', message: 'Company name too long (max 100 chars)' }, { status: 400 });
    }

    const country = typeof body.country === 'string' ? body.country.trim() : '';
    if (country.length > 50) {
      return NextResponse.json({ error: 'Bad Request', message: 'Country name too long (max 50 chars)' }, { status: 400 });
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Bad Request', message: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    if (body.items && (!Array.isArray(body.items) || body.items.length > MAX_ITEMS)) {
      return NextResponse.json({ error: 'Bad Request', message: 'Invalid items array (max 20 items)' }, { status: 400 });
    }

    const burst = await ipBurstLimiter.check(ip);
    if (!burst.success) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Please wait before submitting another inquiry.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.max(1, Math.ceil(burst.reset / 1000)).toString(),
          },
        },
      );
    }

    const daily = await ipDailyLimiter.check(ip);
    if (!daily.success) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Daily limit reached for this IP.' },
        { status: 429 },
      );
    }

    const emailRate = await emailLimiter.check(email);
    if (!emailRate.success) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Please wait before submitting another inquiry with this email.' },
        { status: 429 },
      );
    }

    const session = await getServerSession(authOptions);

    const inquiryPayload = {
      customer_name,
      email,
      company: company || null,
      country: country || null,
      message: message || null,
      app_user_id: session?.user?.id || null,
    };

    const inquiry = await directus.request(createItem('inquiries', inquiryPayload as any));

    let normalizedItems: any[] = [];
    if (Array.isArray(body.items) && body.items.length > 0) {
      normalizedItems = body.items.slice(0, MAX_ITEMS).map((item: any) => {
        const productId = typeof item.product_id === 'string' ? item.product_id.trim() : null;
        const quantityValue = Number.parseInt(item.quantity, 10);
        return {
          inquiry_id: inquiry.id,
          product_id: productId && productId.length > 0 ? productId : null,
          quantity: Math.max(1, Math.min(100000, Number.isFinite(quantityValue) ? quantityValue : 1)),
          remark: typeof item.remark === 'string' ? item.remark.slice(0, 200) : null,
        };
      });

      await directus.request(createItems('inquiry_items', normalizedItems as any));
    }

    console.log(`[RFQ] Success: Inquiry ${inquiry.id} created for request ${requestId}`);

    sendNotification(
      { ...inquiryPayload, id: inquiry.id },
      normalizedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        remark: item.remark,
      })),
    ).catch((emailError: any) => {
      console.error(`[RFQ] Failed to send notification for inquiry ${inquiry.id}:`, emailError?.message || emailError);
    });

    return NextResponse.json({ inquiry_id: inquiry.id }, { status: 201 });
  } catch (error: any) {
    const errorMsg = error?.errors?.[0]?.message || error?.message || 'Unknown Error';
    console.error(`[RFQ] Failed request ${requestId}:`, errorMsg);

    if (error?.errors?.[0]?.extensions?.code === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Database permission denied' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMsg },
      { status: 500 },
    );
  }
}
