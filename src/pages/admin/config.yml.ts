import config from '../../cms/decap.config.yml?raw';

/** Serves the CMS config in dev and the static production build. */
export function GET() {
  return new Response(config, {
    headers: {
      'Content-Type': 'application/yaml; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
