# Pixel accent font ("Pixel Font7")

The design uses a licensed retro/pixel display typeface for every orange
accent headline (Hero "вивчати іспанську", section H2/H3s, etc.).

The Figma MCP integration cannot export the actual font binary — only the
family name ("Pixel Font7") is available. Until the real font is supplied,
the site falls back to **Press Start 2P** (self-hosted via `@fontsource`,
Cyrillic-capable) so the layout, spacing and Ukrainian text remain fully
readable and on-brand.

## How to install the real font

1. Obtain the licensed "Pixel Font7" files (or whichever pixel font the
   client ultimately licenses) in **WOFF2** format (add WOFF as a fallback
   for older browsers if available).
2. Drop the files into this folder using these exact names:
   - `pixel-font7-regular.woff2`
   - `pixel-font7-regular.woff` (optional fallback)
3. Open [`src/styles/base/_fonts.scss`](../../../src/styles/base/_fonts.scss)
   and uncomment the `@font-face` block for `Pixel Font7`.
4. Rebuild (`npm run build`) — `--font-pixel` in
   [`src/styles/tokens/_typography.scss`](../../../src/styles/tokens/_typography.scss)
   already lists `'Pixel Font7'` first, so every accent heading picks it up
   automatically, no component changes required.
