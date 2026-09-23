export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const cleanPath = path.replace(/^\/+/, '');
  return cleanPath ? `${base}${cleanPath}` : base;
}

export function stationUrl(id: string): string {
  return withBase(`stations/${id}/`);
}

export function surveyUrl(id: string): string {
  return withBase(`surveys/${id}/`);
}
