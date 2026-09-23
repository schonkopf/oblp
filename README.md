# OBLP Website Foundation

A static, data-driven research website for the Ocean Biodiversity Listening Project, built with Astro and TypeScript. The current content is deliberately fictional demonstration material: it validates the architecture without asserting OBLP research results, locations, publications, partnerships, or funding.

## Requirements

- Node.js 24 (see `.nvmrc`)
- npm 11 or a compatible npm release

## Local development

```bash
npm install
npm run dev
```

Astro will print the local address. The default local configuration uses `/` as the base path.

## Validation and production build

```bash
npm run check
npm run build
npm run preview
```

`npm run build` first runs Astro's TypeScript/content validation and then creates a static site in `dist/`. No server, database, authentication, or CMS is required.

## Routes

- `/` — project overview
- `/explore/` — published station and survey index
- `/research/` — research themes, findings, and publication records
- `/resources/` — resources catalogue
- `/about/` — project purpose, people, and partners
- `/stations/[id]/` — generated station detail pages
- `/surveys/[id]/` — generated survey detail pages

Only entries with `status: published` are included in indexes and dynamic pages.

## Content architecture

Schemas are defined in `src/content.config.ts`; records live in `src/content/<collection>/`. The eleven collections are:

| Collection | Purpose | Principal references |
| --- | --- | --- |
| `regions` | Geographic groupings | — |
| `stations` | Long-term, campaign, or mobile observation sites | region |
| `surveys` | Spatial, temporal, or experimental activities | region, stations |
| `audio` | Audio metadata and optional media | station and/or survey |
| `visualizations` | Figures, maps, interactives, or independent HTML | station or survey |
| `findings` | Evidence statements | regions, stations, surveys, visualization, publication |
| `publications` | Bibliographic records | — |
| `resources` | Datasets, software, protocols, and teaching material | — |
| `people` | Project participants | — |
| `partners` | Collaborating organizations | — |
| `pages` | Page-specific editorial copy | scientific collections at composition time |

Page Markdown is editorial rather than presentational. Files in `src/content/pages/` expose concise, typed fields for page titles, introductions, section copy, and actions. Primary Astro routes decide how those fields are composed and connect them with scientific records; Markdown heading order and list syntax do not determine page layout. The homepage, for example, takes its narrative copy from `pages/home.md` while its observation network and research evidence come from the stations, surveys, regions, findings, and partner collections.

When editing a primary page, change its corresponding file in `src/content/pages/`. Do not duplicate stations, surveys, findings, publications, or other research records there. Add or revise those records in their dedicated collections so references, metadata, and publication status remain authoritative throughout the site.

Each filename supplies a stable, URL-safe content ID. References use those IDs and are checked at build time. Common fields include `title`, `summary`, `status`, `demo`, and optional `updated`. Media and domain-specific fields are optional so incomplete historical records can render explicit missing-data states instead of failing unexpectedly.

To add real content:

1. Copy a demonstration Markdown file in the relevant collection.
2. Rename it to the intended stable ID; avoid changing the filename after other records reference it.
3. Replace every fictional value with reviewed information and set `demo: false`.
4. Leave genuinely unavailable optional fields out rather than inventing values.
5. Keep `status: draft` until editorial review is complete.
6. Run `npm run build`; invalid fields or broken collection references will fail the build.

## GitHub Pages

The site uses Astro's official GitHub Pages action in `.github/workflows/deploy.yml`. In the GitHub repository, open **Settings → Pages** and select **GitHub Actions** as the source.

`astro.config.mjs` derives deployment values consistently:

- In GitHub Actions, `GITHUB_REPOSITORY` sets `site` to `https://<owner>.github.io`.
- A normal project repository receives `base: /<repository-name>`.
- A special `<owner>.github.io` repository receives `base: /`.
- `SITE_URL` and `BASE_PATH` can explicitly override those values for a custom domain or unusual deployment.

All internal links and public-asset URLs use `import.meta.env.BASE_URL` through `src/utils/urls.ts`, so the same templates support both root-domain and repository-subpath deployments.

Example subpath build:

```bash
GITHUB_REPOSITORY=example/oblp-website npm run build
```

Example custom-domain build:

```bash
SITE_URL=https://oblp.example.org BASE_PATH=/ npm run build
```

Pushing to `main` triggers the workflow. A successful local build confirms that the generated site is deployable, but does not confirm that GitHub Pages has deployed it; verify the Actions run and Pages URL after pushing to GitHub.

## Design system

Reusable tokens for color, typography, spacing, radii, and layout are defined at the top of `src/styles/global.css`. Shared structure lives in `src/layouts/BaseLayout.astro`, and reusable components are in `src/components/`.

The site ships no client-side application framework. The Explore directory progressively enhances its searchable cards with a Leaflet and GeoJSON map; navigation and all record links remain available as semantic HTML if JavaScript or map tiles are unavailable.
