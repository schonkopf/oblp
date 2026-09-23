import { defineConfig } from 'astro/config';

const repository = process.env.GITHUB_REPOSITORY ?? '';
const [owner = 'example', repositoryName = ''] = repository.split('/');
const isUserSite = repositoryName.toLowerCase() === `${owner.toLowerCase()}.github.io`;

const site = process.env.SITE_URL ?? (repository ? `https://${owner}.github.io` : 'https://example.github.io');
const base = process.env.BASE_PATH ?? (repositoryName && !isUserSite ? `/${repositoryName}` : '/');

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
});
