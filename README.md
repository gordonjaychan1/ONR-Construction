# ONR Construction

Sample website for ONR Construction, a licensed general and concrete contractor in Ceres, CA (CSLB #1119077).

- `index.html`: page content
- `style.css`: design (brand colors are at the top; orange is sampled from the ONR logo)
- `script.js`: menu, hero slideshow, services accordion, project filters and photo viewer, and the estimate form (sent via FormSubmit)
- `images/work/`: project photos from @onr.construction
- `images/brand/logo.png`: the official logo as supplied (orange mark, black lettering)
- `images/brand/logo-white.png`: same file with the black lettering recoloured white, for the
  dark header and footer. Regenerate it if the official logo changes, or replace it with an
  official reversed version if ONR has one.

## Before going live
- Activate the estimate form: submit one test request, then click "Activate" in the email FormSubmit
  sends to info@onrconstruction.com (confirmed by ONR as their business inbox). Check spam if it does not arrive.
- Confirm service-area cities.
- Confirm the two review excerpts and add reviewer first names if wanted.
- Ask ONR for a vector logo (SVG/AI/EPS) if they have one; the current PNG is 865px wide,
  which is fine at the sizes used here but will not scale further.
- Swap in higher-resolution originals of the project photos if available.

## Changing the hero slideshow
Both hero photos cycle. Each `<div class="slides">` in `index.html` holds its own `<img>` set —
add or remove one to change that frame's rotation; the first loads eagerly.
`data-hold` is the time per photo and `data-offset` staggers the second frame so the two never
change at the same moment. Each frame's orange progress bar is timed from those values in
`script.js`, so no CSS change is needed when you retime them.

To drop the progress bars, delete the two `<span class="slides-bar">` elements in `index.html`.
The slideshows and the pause button keep working without them.

To go back to a single hero photo, delete the `<figure class="hero-shot hero-shot-b">` block and
widen `.hero-shot-a` in `style.css`. No JS change needed.

## Adding a project photo
Drop the jpg into `images/work/`, copy one of the `<button class="proj">` blocks in the Projects section,
and set `data-cat` to `concrete`, `sitework`, or `remodel`.
