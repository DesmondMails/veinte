const REQUIRED_FIELDS = ['name', 'level', 'goal', 'contact'];
const MAX_FIELD_LENGTH = 500;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function clean(value) {
  return String(value ?? '')
    .trim()
    .replaceAll(/[\r\n]+/g, ' ')
    .slice(0, MAX_FIELD_LENGTH);
}

async function readPayload(request) {
  const contentType = request.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    return Object.fromEntries(await request.formData());
  }

  throw new Error('Unsupported content type.');
}

function formatLead(payload) {
  return [
    'New website lead - Veinte',
    '',
    `Name: ${payload.name}`,
    `Spanish level: ${payload.level}`,
    `Learning goal: ${payload.goal}`,
    `Contact: ${payload.contact}`,
  ].join('\n');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    if (!env.ALLOWED_ORIGIN || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return new Response('Worker secrets are not configured.', { status: 500 });
    }

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response('Veinte Telegram leads Worker is running.');
    }

    if (origin !== env.ALLOWED_ORIGIN) {
      return new Response('Origin is not allowed.', { status: 403 });
    }

    if (request.method === 'OPTIONS' && url.pathname === '/api/lead') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST' || url.pathname !== '/api/lead') {
      return json({ error: 'Not found.' }, 404, origin);
    }

    let rawPayload;
    try {
      rawPayload = await readPayload(request);
    } catch {
      return json({ error: 'Invalid form payload.' }, 400, origin);
    }

    // Do not send honeypot submissions, but make the response indistinguishable
    // from a genuine submission to avoid helping automated spam tools.
    if (clean(rawPayload['bot-field'])) {
      return json({ ok: true }, 200, origin);
    }

    const payload = Object.fromEntries(
      REQUIRED_FIELDS.map((field) => [field, clean(rawPayload[field])]),
    );
    const missingField = REQUIRED_FIELDS.find((field) => !payload[field]);
    if (missingField) {
      return json({ error: 'Please complete all required fields.' }, 400, origin);
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: formatLead(payload),
        }),
      },
    );

    if (!telegramResponse.ok) {
      console.error('Telegram rejected the lead message.', await telegramResponse.text());
      return json({ error: 'Unable to send the request. Please try again.' }, 502, origin);
    }

    return json({ ok: true }, 200, origin);
  },
};
