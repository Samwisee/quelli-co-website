Recommended assets structure

This repository currently stores images in `assets/` and code in `assets/css`.

Suggested structure (non-destructive changes applied):

assets/
  css/        # stylesheets (existing)
  js/         # JS files (moved here)
  icons/      # SVG icons (added)
  img/        # recommended place for raster images (not moved automatically)
  ...other static files

Notes:
- Raster images (PNG) were left in place to avoid corrupting binaries during restructuring.
  Move them to `assets/img/` when you can copy files via your filesystem or git.
- Update references in code if you move images.
