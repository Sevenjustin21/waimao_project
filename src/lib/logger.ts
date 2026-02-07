type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function write(level: LogLevel, message: string, fields: Record<string, unknown> = {}) {
  const payload = {
    level,
    time: new Date().toISOString(),
    message,
    ...fields,
  };
  const serialized = JSON.stringify(payload);
  if (level === 'error') {
    console.error(serialized);
  } else if (level === 'warn') {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

export const logger = {
  info(message: string, fields?: Record<string, unknown>) {
    write('info', message, fields);
  },
  warn(message: string, fields?: Record<string, unknown>) {
    write('warn', message, fields);
  },
  error(message: string, fields?: Record<string, unknown>) {
    write('error', message, fields);
  },
  debug(message: string, fields?: Record<string, unknown>) {
    write('debug', message, fields);
  },
};

interface RequestLogFields {
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  actorType: string;
  ip: string;
}

export function logRequest(fields: RequestLogFields) {
  logger.info('request.completed', { ...fields });
}
