const appEnv = process.env.APP_ENV || process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';
const isProd = appEnv === 'production';

function extractOrigin(urlValue) {
  if (!urlValue) return null;
  try {
    const parsed = new URL(urlValue);
    return `${parsed.protocol}//${parsed.host}`;
  } catch (error) {
    return null;
  }
}

const extraConnectSources = new Set();
[
  process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL || 'http://localhost:8055',
  process.env.MEILISEARCH_HOST || 'http://localhost:7700',
].forEach((value) => {
  const origin = extractOrigin(value);
  if (origin) {
    extraConnectSources.add(origin);
  }
});

const strictConnectSrc = ["'self'", ...extraConnectSources];
const relaxedConnectSrc = ["'self'", 'ws:', 'wss:', 'data:', ...extraConnectSources];

const strictCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  `connect-src ${strictConnectSrc.join(' ')}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
].join('; ');

const relaxedCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  `connect-src ${relaxedConnectSrc.join(' ')}`,
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [];

if (isProd) {
  securityHeaders.push({
    key: 'Content-Security-Policy',
    value: strictCsp,
  });
} else {
  securityHeaders.push({
    key: 'Content-Security-Policy-Report-Only',
    value: relaxedCsp,
  });
}

const shouldSendHsts =
  isProd &&
  Boolean(
    (process.env.APP_URL && process.env.APP_URL.startsWith('https://')) ||
      (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('https://')),
  );

if (shouldSendHsts) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

securityHeaders.push(
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
);

/** @type {import('next').NextConfig} */
const nextConfig = (() => {
  const remotePatterns = [];
  const fallbackHosts = [
    { protocol: 'http', hostname: 'localhost', port: '8055' },
    { protocol: 'http', hostname: '127.0.0.1', port: '8055' },
  ];

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
  try {
    const parsed = new URL(directusUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || '',
      pathname: '/assets/**',
    });
  } catch (error) {
    console.warn('[next.config.js] Failed to parse NEXT_PUBLIC_DIRECTUS_URL, using default localhost:8055');
    remotePatterns.push({
      protocol: 'http',
      hostname: 'localhost',
      port: '8055',
      pathname: '/assets/**',
    });
  }

  fallbackHosts.forEach((entry) => {
    if (!remotePatterns.some((pattern) => pattern.hostname === entry.hostname)) {
      remotePatterns.push({ ...entry, pathname: '/assets/**' });
    }
  });

  return {
    images: {
      remotePatterns,
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ];
    },
  };
})();

module.exports = nextConfig;
