import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const REQUEST_ID_HEADER = 'x-request-id';

export function getOrCreateRequestId(req: NextRequest): string {
  const existing = req.headers.get(REQUEST_ID_HEADER);
  if (existing && existing.trim().length > 0) {
    return existing.trim();
  }
  return randomUUID();
}

export function attachRequestId(res: NextResponse, requestId: string) {
  if (!requestId) {
    return;
  }
  res.headers.set(REQUEST_ID_HEADER, requestId);
}

export { REQUEST_ID_HEADER };
