# Leuria demos

Websites whose AI features run on the visitor's own AI, through [Leuria](https://github.com/leur-ia/leuria). Without it, they fall back to the browser's AI or a small model in the page.

| Demo | What it shows |
| --- | --- |
| `shop/` | Kiln & Co., a mug shop: the Connect button, an assistant using the page's own tools, an order form filled in with structured output. `plain.html` is the same shop in plain HTML with the web components |
| `notes/` | Maren's notebook, a potter's digital garden: search by meaning, related notes, answers with links to the notes |
| `dex/` | The Hollowmark field guide, 48 original creatures: search by meaning, similar creatures, an AI team builder |
| `showroom/` | The page that links them all |

```sh
pnpm install
pnpm shop       # http://localhost:5173
pnpm notes      # http://localhost:5175
pnpm dex        # http://localhost:5176
pnpm build      # every demo as one static site in dist/ (pnpm serve to look: http://localhost:4173)
```

Run Leuria (the desktop app, or `npx @leuria/cli`) to try them with your own AI.

## Leuria packages, for now from source

Until the `@leuria/*` packages are on npm, this repo expects the leuria repo next to it (`../leuria`, installed with `pnpm install`):

- `pnpm-workspace.yaml` overrides every `@leuria/*` package with a link to `../leuria/packages/*` (types and `pnpm check` use their builds: run `pnpm build` in `../leuria` first);
- `leuria-aliases.mjs` points Vite at their sources, so the demos need no build of Leuria and reload when it changes.

To use the published packages, delete the overrides and the aliases.
