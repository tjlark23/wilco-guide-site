# WilCo Guide — Static Site

Static HTML/CSS site for [wilcoguide.com](https://www.wilcoguide.com). Deployed directly to Cloudflare Pages.

## Stack

- Pure HTML + CSS (no frameworks, no build step)
- Landing page uses Tailwind CDN (Inter + Space Grotesk)
- Subpages use custom `styles.css` design system (DM Sans + Fraunces)

## Structure

```
wilcoguide-site/
├── index.html              # Landing page (live wilcoguide.com)
├── styles.css              # Design system for vertical guide subpages
├── foundation-repair/      # Foundation repair guide
├── estate-sales/           # Estate sales guide
├── robots.txt
├── sitemap.xml
├── 404.html
└── README.md
```

## Local Development

Open `index.html` in a browser. No build step required.

## Deployment

Push to `main` → Cloudflare Pages auto-deploys.
