import config from '../cms/decap.config.yml?raw';

/**
 * Decap resolves its default config path from the site root (`/config.yml`),
 * even when the CMS UI itself lives under `/admin`.
 */
export function GET() {
  return new Response(config, {
    headers: {
      'Content-Type': 'application/yaml; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
