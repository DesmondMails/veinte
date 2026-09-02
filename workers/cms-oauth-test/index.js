const COOKIE_NAME = 'veinte_oauth_state';
const STATE_TTL_SECONDS = 600;

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const prefix = `${name}=`;

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

function createState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function clearStateCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/callback; Max-Age=0`;
}

function callbackPage(status, payload, allowedOrigin) {
  const serializedOrigin = JSON.stringify(allowedOrigin);
  const serializedPayload = JSON.stringify(payload).replaceAll('<', '\\u003c');

  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Veinte CMS</title></head>
  <body>
    <script>
      const cmsOrigin = ${serializedOrigin};
      const payload = ${serializedPayload};

      function receiveMessage(event) {
        if (event.origin !== cmsOrigin || !window.opener) return;

        window.opener.postMessage(
          'authorization:github:${status}:' + JSON.stringify(payload),
          cmsOrigin,
        );
        window.removeEventListener('message', receiveMessage);
        window.close();
      }

      window.addEventListener('message', receiveMessage);
      window.opener?.postMessage('authorizing:github', cmsOrigin);
    </script>
    <p>Returning to Veinte CMS...</p>
  </body>
</html>`;
}

function htmlResponse(status, payload, env, responseStatus = 200) {
  return new Response(callbackPage(status, payload, env.ALLOWED_ORIGIN), {
    status: responseStatus,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': clearStateCookie(),
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.ALLOWED_ORIGIN) {
      return new Response('OAuth Worker secrets are not configured.', { status: 500 });
    }

    if (url.pathname === '/') {
      return new Response('Veinte CMS OAuth proxy is running.');
    }

    if (url.pathname === '/auth') {
      const state = createState();
      const callbackUrl = new URL('/callback', url.origin).toString();
      const githubUrl = new URL('https://github.com/login/oauth/authorize');

      githubUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      githubUrl.searchParams.set('redirect_uri', callbackUrl);
      githubUrl.searchParams.set('scope', 'repo');
      githubUrl.searchParams.set('state', state);

      return new Response(null, {
        status: 302,
        headers: {
          Location: githubUrl.toString(),
          'Set-Cookie': `${COOKIE_NAME}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/callback; Max-Age=${STATE_TTL_SECONDS}`,
          'Cache-Control': 'no-store',
        },
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const expectedState = getCookie(request, COOKIE_NAME);

      if (!code || !state || !expectedState || state !== expectedState) {
        return htmlResponse('error', { error: 'Invalid OAuth state.' }, env, 400);
      }

      const callbackUrl = new URL('/callback', url.origin).toString();
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: callbackUrl,
        }),
      });
      const token = await tokenResponse.json();

      if (!tokenResponse.ok || token.error || !token.access_token) {
        return htmlResponse('error', token, env, 401);
      }

      return htmlResponse('success', { provider: 'github', token: token.access_token }, env);
    }

    return new Response('Not found.', { status: 404 });
  },
};
