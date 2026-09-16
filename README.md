# ONR Construction

Sample website for ONR Construction, a licensed general and concrete contractor in Ceres, CA (CSLB #1119077).

- `index.html`: page content
- `style.css`: design (brand colors are at the top; orange is sampled from the ONR logo)
- `script.js`: menu, services accordion, project filters and photo viewer, and the estimate form (sent via FormSubmit)
- `images/work/`: project photos from @onr.construction

## Before going live
- Set `FORM_EMAIL` in `script.js` to the inbox that should receive estimate requests (currently a placeholder).
- Confirm hours, service-area cities, and the email address shown on the page.
- Confirm the two review excerpts and add reviewer first names if wanted.
- Swap in higher-resolution originals of the project photos if available.

## Adding a project photo
Drop the jpg into `images/work/`, copy one of the `<button class="proj">` blocks in the Projects section,
and set `data-cat` to `concrete`, `sitework`, or `remodel`.
