QUELLI & CO — Static site

This repository contains a small static marketing site (single-page). Changes made in this update:

- Added SEO meta tags and basic structured data to `index.html`.
- Added `robots.txt` and `sitemap.xml` (edit hostnames before publishing).
- Improved responsive CSS and header offset in `assets/css/theme.css` and `assets/css/index.css`.
- Improved carousel accessibility and keyboard support in `assets/site.js`.
- Minor performance tweaks (preload of critical CSS, picture element for hero image).

How to preview

Open `index.html` in a local static server. From the project root you can run:

```bash
# Python 3
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

Next steps

- Wire newsletter forms to your email provider or server.
- Replace placeholder hostnames in `robots.txt` and `sitemap.xml`.
- Add more sitemap entries and open graph images hosted with absolute URLs.
- Consider adding automated build (e.g., a simple npm script) and minification for production.
