# Continuity Pack — visual thesis

## Direction: topographic cartography

Continuity Pack should feel like a field map for a route that must still work
when ordinary landmarks disappear. Concentric contour lines stand for repeated,
tested recovery paths; survey marks stand for hashes and verification points;
the sealed archive is a destination, not an abstract cloud. The visual system is
quietly operational rather than cyber-themed, glossy, or alarmist.

The website uses a deliberately single-mode, warm paper treatment. This is a
documentation surface and field guide, so a stable paper-and-ink environment is
more appropriate than a theme toggle. The terminal demo supplies a darker,
focused layer without changing the overall mode.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `paper` | `#F3ECDD` | Main background; archival field paper |
| `paper-raised` | `#FFF9ED` | Commands, forms, and lifted annotations |
| `ink` | `#17251F` | Primary text; near-black surveyor ink |
| `ink-muted` | `#526159` | Secondary copy (7.0:1 on paper) |
| `pine` | `#1E5B45` | Primary action and mapped route |
| `pine-dark` | `#123D2F` | Hover/focus and terminal shell |
| `ochre` | `#9B4E1D` | Survey pins and paid-tier emphasis |
| `ridge` | `#C9BEA8` | Dividers and contour lines |
| `success` | `#17613E` | Verified state, always with text/icon |
| `warning` | `#8A4817` | Attention state, always with text/icon |
| `danger` | `#9B2F2F` | Failure state, always with text/icon |

All body text/action pairings meet WCAG AA. Focus uses a 3px ochre outline on
paper and a 3px raised-paper outline on dark, warning, and ochre surfaces. Both
treatments keep at least 3:1 contrast with the adjacent surface.

## Typography

- Display and body: the system humanist serif stack `Iowan Old Style`,
  `Palatino Linotype`, `Book Antiqua`, `Georgia`, serif. It reads like a durable
  printed field guide and avoids a font payload or third-party request.
- Commands, hashes, timestamps, and eyebrow labels: `ui-monospace`,
  `SFMono-Regular`, `Cascadia Code`, `Liberation Mono`, monospace. Tabular
  figures make audit output scannable.
- Scale: 16px body; 0.75rem label; 1rem body; 1.25rem subhead; 1.75rem section;
  `clamp(2.6rem, 7vw, 5.8rem)` hero. Long copy is capped at 68 characters.

## Spacing and layout

An 8px base rhythm (`4, 8, 16, 24, 32, 48, 64, 96`) echoes map grids. The
desktop shell uses a 12-column field with generous margins; the hero splits 5/7
between promise and illustration. Sections are separated by whitespace and
coordinate labels rather than a stack of generic cards. At 390px, the map moves
below the promise, comparison rows become vertical, and the persistent header
collapses to the essential install/purchase actions. All targets remain 44px.

## Interaction grammar and states

Links draw a short route underline. Buttons move by 1px on press. The demo is a
three-stop route—Pack, Verify, Restore—with a clear selected state, arrow-key
navigation, and a plain text transcript. License verification has explicit
checking, active, offline/cached, and inactive copy; the free documentation is
never blocked. Offline state appears as a small map-status strip with a retry
action. Empty demo output gives a next-step command rather than a blank panel.

## Motion policy

Contour strokes reveal once on initial view (600–900ms) and state changes use
opacity/translate transitions of 180–240ms. Nothing loops. Under
`prefers-reduced-motion: reduce`, path drawing and translation are removed and
states change instantly; hierarchy remains through line weight, scale, and
contrast.

## Asset plan and provenance

- `site/public/contour-vault.webp`: original raster hero illustration generated
  for this product with `/opt/fleet/lib/gen-image.sh`, using the factory
  `factory-image` deployment, then locally converted to WebP. Prompt: “Editorial
  topographic cartography illustration for a small-business data recovery CLI:
  a sealed archival document case at the end of a clearly traced contour-map
  route, three precise survey checkpoints, invoices and customer ledgers safely
  nested inside the case, warm cream paper, deep pine green ink, restrained burnt
  ochre markers, tactile letterpress and fine engraved line texture, wide 4:3
  composition, useful negative space, calm capable mood, no people, no logos, no
  words, no letters, no numbers, no gradients, no cloud icon, no watermark.”
  Generated under the OpenAI output terms applicable to the factory account.
- `site/public/social-card.webp`: a locally cropped 1200×630 derivative of the
  original contour-vault illustration for link previews. No new source asset
  or external material was introduced.
- `site/public/apple-touch-icon.png`: a locally cropped 180×180 detail from the
  same original illustration for device home screens.
- Small route/check/seal icons are original inline SVG built from simple map
  notation and authored in the repository. They are deterministic UI assets,
  not substitutes for the hero raster.

## Why this fits

Backup tools tend to look like abstract clouds or security dashboards. This
product instead gives an owner a route they can read, carry, and test. The
cartographic system makes the product’s core claim visible: a backup only counts
when the path back is known.
