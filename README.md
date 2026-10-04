# ONR Construction

Sample website for ONR Construction, a licensed general and concrete contractor in Ceres, CA (CSLB #1119077).

- `index.html`: page content
- `style.css`: design (brand colors are at the top; orange is sampled from the ONR logo)
- `script.js`: menu, hero slideshow, services accordion, project filters and photo viewer, and the estimate form (sent via FormSubmit)
- `images/work/`: project photos from @onr.construction

## Before going live
- Set `FORM_EMAIL` in `script.js` to the inbox that should receive estimate requests (currently a placeholder).
- Confirm hours, service-area cities, and the email address shown on the page.
- Confirm the two review excerpts and add reviewer first names if wanted.
- Swap in higher-resolution originals of the project photos if available.

## Changing the hero slideshow
Both hero photos cycle. Each `<div class="slides">` in `index.html` holds its own `<img>` set —
add or remove one to change that frame's rotation; the first loads eagerly.
`data-hold` is the time per photo and `data-offset` staggers the second frame so the two never
change at the same moment. If you change `data-hold`, match the transition on
`.slides-bar i` in `style.css`.

To go back to a single hero photo, delete the `<figure class="hero-shot hero-shot-b">` block and
widen `.hero-shot-a` in `style.css`. No JS change needed.

## Adding a project photo
Drop the jpg into `images/work/`, copy one of the `<button class="proj">` blocks in the Projects section,
and set `data-cat` to `concrete`, `sitework`, or `remodel`.
