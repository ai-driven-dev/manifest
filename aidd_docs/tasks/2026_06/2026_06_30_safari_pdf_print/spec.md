# Safari PDF Print

## Target

Allow the manifesto homepage to be printed or saved as a PDF in Safari with the complete manifesto content visible and readable.

## Hard constraints

- The printable document includes the cover, definition, values, principles, signatures, and footer content.
- Screen rendering must remain unchanged for normal browsing.
- Interactive-only controls and affordances must not be required for the PDF to contain the information.
- The manifesto remains English-only.

## Non-goals

- Add a dedicated PDF export service.
- Add browser-specific user instructions or visible print help text to the page.
- Redesign the screen layout.
- Change manifesto editorial content.

## Done-when

- A print-media browser check verifies that the major homepage sections are visible under `print` media.
- A print-media browser check verifies that representative value, principle, definition, signature, and footer text are present in the rendered document.
- Existing build and test commands still pass.

## Stakeholders

- Decider: project owner.
- Owner: manifesto app maintainers.
- Consumer: readers who print or save the manifesto as PDF from Safari.

## Context

Safari/WebKit print rendering is sensitive to screen-only layout constraints such as sticky positioning, viewport heights, clipped overflow, transforms, and reveal animations. The current app already has print CSS, but it does not fully flatten the current page structure for paged output.
