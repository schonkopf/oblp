import { getEntry, type CollectionEntry } from 'astro:content';

export interface ResolvedObservationOrigin {
  survey: CollectionEntry<'surveys'>;
  observationSite: CollectionEntry<'surveys'>['data']['observationSites'][number];
}

/** Resolve and validate a station's survey-site predecessor. */
export async function resolveObservationOrigin(
  station: CollectionEntry<'stations'>,
): Promise<ResolvedObservationOrigin | undefined> {
  const origin = station.data.origin;
  if (!origin) return undefined;

  const survey = await getEntry(origin.survey);
  if (!survey) {
    throw new Error(`Station "${station.id}" has an origin that references missing survey "${origin.survey.id}".`);
  }

  const observationSite = survey.data.observationSites.find(({ id }) => id === origin.observationSite);
  if (!observationSite) {
    throw new Error(
      `Station "${station.id}" origin references observation site "${origin.observationSite}", `
      + `but survey "${survey.id}" does not contain that site.`,
    );
  }

  return { survey, observationSite };
}

/** Derive the reverse survey-site relationship from authoritative Station origins. */
export async function deriveStationContinuations(
  survey: CollectionEntry<'surveys'>,
  stations: CollectionEntry<'stations'>[],
): Promise<Map<string, CollectionEntry<'stations'>[]>> {
  const continuations = new Map<string, CollectionEntry<'stations'>[]>();
  const descendants = stations.filter(({ data }) => data.origin?.survey.id === survey.id);

  for (const station of descendants) {
    const origin = await resolveObservationOrigin(station);
    if (!origin) continue;
    const existing = continuations.get(origin.observationSite.id) ?? [];
    existing.push(station);
    continuations.set(origin.observationSite.id, existing);
  }

  return continuations;
}
