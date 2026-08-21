# Veinte

Astro landing page for the Veinte Spanish school. Content lives in Astro Content Collections and can be managed through Decap CMS at `/admin` after authentication is configured.

## Commands

```sh
npm install
astro dev --background
npm run cms:local
npm run build
```

Manage the local server with `astro dev status`, `astro dev logs`, and `astro dev stop`.

## Content ownership

The owner can edit these sections in Decap CMS without touching code:

- Courses: price, previous price, available seats, CTA, icon, description, order and program.
- Student reviews: name, photo, "point A", "point B" and order.
- FAQ, contact email, social links, hero/CTA/footer copy and legal pages.

Content files are stored in `src/content`. UI structure, animations, and the non-editable storytelling sections remain in `src/components` and `src/data`.

## Decap CMS

The editor is already available in the codebase at `/admin`:

- `src/pages/admin/index.astro` serves the Decap application at `/admin`.
- `src/cms/decap.config.yml` describes every editing form and is served at `/config.yml` (Decap's default lookup path).
- New review photos are stored next to their Markdown file in `src/content/reviews`, preserving Astro image optimization.

### Local testing

Keep the Astro dev server running, then start `npm run cms:local` in a second terminal. With both services running, `/admin` reads and writes this local checkout through Decap Proxy; no GitHub login or commit is involved. Stop the proxy when finished. The local proxy does not support Decap's `editorial_workflow`, which this project does not use.

### Production authentication

The recommended production path for this Netlify-hosted project is Netlify's OAuth provider with Decap's direct GitHub backend. There is no separate app server or database to host.

1. Create a GitHub OAuth App with callback URL `https://api.netlify.com/auth/done`.
2. In Netlify, open **Project configuration → Access & security → OAuth**, install the GitHub provider, and enter its Client ID and Client Secret.
3. In GitHub, give the owner a GitHub account and write access to `DesmondMails/veinte`.
4. Deploy to Netlify. The owner can then open `https://<site-domain>/admin`, choose **Login with GitHub**, make edits and press **Publish**. Each publish creates a Git commit and Netlify deploys the update automatically.

Netlify and GitHub are complementary here: Netlify hosts and builds the site, while GitHub remains the source of content and access control. The owner needs GitHub write access to publish changes through the GitHub backend. Do not use Netlify Git Gateway for this new project: Netlify now marks it as deprecated for new configurations. An external OAuth proxy, such as a Cloudflare Worker, remains a valid fallback if the site moves away from Netlify.
