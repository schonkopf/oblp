import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const status = z.enum(['draft', 'published']).default('draft');
const mediaAsset = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
  credit: z.string().optional(),
});
const common = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  status,
  demo: z.boolean().default(false),
  updated: z.coerce.date().optional(),
});
// A single, filterable vocabulary describing what a station actually observes.
// Keep this list specific rather than mixing broad modes (such as "environmental")
// with measurements (such as "temperature").
const observationType = z.enum([
  'soundscape',
  'temperature',
  'light',
  'eDNA',
  'imagery',
  'video',
  'water-chemistry',
  'oceanographic',
]);
const collection = (name: string) => glob({ pattern: '**/*.{md,json,yaml,yml}', base: `./src/content/${name}` });

const regions = defineCollection({
  loader: collection('regions'),
  schema: common.extend({
    oceanBasin: z.string().optional(),
    media: mediaAsset.optional(),
  }),
});

const stations = defineCollection({
  loader: collection('stations'),
  schema: common.extend({
    description: z.string().min(1).optional(),
    region: reference('regions'),
    recordType: z.enum(['long-term-station', 'short-term-station']),
    habitat: z.string().optional(),
    ecosystem: z.string().optional(),
    marineProtectedArea: z.boolean().optional(),
    depthM: z.number().nonnegative().optional(),
    coordinates: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
    monitoringPeriod: z.string().optional(),
    monitoringSince: z.coerce.date().optional(),
    operationalStatus: z.enum(['operational', 'seasonal', 'inactive', 'decommissioned', 'unknown']).optional(),
    observationTypes: z.array(observationType).default(['soundscape']),
    instrumentation: z.array(z.string().min(1)).default([]),
    deploymentConfiguration: z.string().optional(),
    heightAboveSeafloorM: z.number().nonnegative().optional(),
    methods: z.array(z.string()).default([]),
    media: mediaAsset.optional(),
    partners: z.array(reference('partners')).default([]),
  }),
});

const surveys = defineCollection({
  loader: collection('surveys'),
  schema: common.extend({
    description: z.string().min(1).optional(),
    region: reference('regions'),
    stations: z.array(reference('stations')).default([]),
    recordType: z.enum(['spatial-survey', 'temporal-survey', 'experimental-survey']),
    period: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    observationTypes: z.array(observationType).default(['soundscape']),
    ecosystem: z.string().optional(),
    habitat: z.array(z.string().min(1)).default([]),
    marineProtectedArea: z.boolean().optional(),
    mapExtent: z.object({
      west: z.number().min(-180).max(180),
      east: z.number().min(-180).max(180),
      south: z.number().min(-90).max(90),
      north: z.number().min(-90).max(90),
    }).refine(({ west, east }) => west < east, 'Survey map extent west must be less than east.')
      .refine(({ south, north }) => south < north, 'Survey map extent south must be less than north.').optional(),
    depthRangeM: z.object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
    }).refine(({ min, max }) => min <= max, 'Survey minimum depth must not exceed maximum depth.').optional(),
    instrumentation: z.array(z.string().min(1)).default([]),
    deploymentConfiguration: z.string().min(1).optional(),
    monitoringSince: z.coerce.date().optional(),
    monitoringStatus: z.enum(['ongoing', 'seasonal', 'completed', 'inactive', 'unknown']).optional(),
    polygon: z.array(z.tuple([z.number(), z.number()])).min(3).optional(),
    methods: z.array(z.string()).default([]),
    media: mediaAsset.optional(),
  }),
});

const audio = defineCollection({
  loader: collection('audio'),
  schema: common.extend({
    station: reference('stations').optional(),
    survey: reference('surveys').optional(),
    recordedAt: z.coerce.date().optional(),
    durationSeconds: z.number().positive().optional(),
    sampleRateHz: z.number().positive().optional(),
    audioType: z.enum(['soundscape', 'species-vocalization', 'anthropogenic-sound', 'other']).optional(),
    file: z.string().min(1).optional(),
    recordingContext: z.string().optional(),
    listenFor: z.array(z.string().min(1)).default([]),
    spectrogram: mediaAsset.optional(),
    license: z.string().optional(),
  }).refine((item) => item.station || item.survey, 'Audio must reference a station or survey.'),
});

const visualizations = defineCollection({
  loader: collection('visualizations'),
  schema: common.extend({
    visualizationType: z.enum(['long-term-spectrogram', 'photogrammetry', 'figure', 'map', 'other']),
    format: z.enum(['interactive-html', 'image', 'external']),
    station: reference('stations').optional(),
    survey: reference('surveys').optional(),
    src: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    interpretation: z.string().min(1).optional(),
    interactive: z.boolean().default(false),
    thumbnail: mediaAsset.optional(),
  }),
});

const findings = defineCollection({
  loader: collection('findings'),
  schema: common.extend({
    regions: z.array(reference('regions')).default([]),
    stations: z.array(reference('stations')).default([]),
    surveys: z.array(reference('surveys')).default([]),
    visualization: reference('visualizations').optional(),
    publication: reference('publications').optional(),
    featured: z.boolean().default(false),
  }),
});

const publications = defineCollection({
  loader: collection('publications'),
  schema: common.extend({
    authors: z.array(z.string()).min(1),
    year: z.number().int().min(1900).max(2100),
    venue: z.string().optional(),
    journal: z.string().optional(),
    doi: z.url().optional(),
    url: z.url().optional(),
    citation: z.string().optional(),
    relatedStations: z.array(reference('stations')).default([]),
    relatedSurveys: z.array(reference('surveys')).default([]),
  }),
});

const resources = defineCollection({
  loader: collection('resources'),
  schema: common.extend({
    resourceType: z.enum(['dataset', 'software', 'tutorial', 'protocol', 'teaching', 'other']),
    url: z.url().optional(),
    file: z.string().optional(),
    license: z.string().optional(),
    citation: z.string().optional(),
    accessConditions: z.string().optional(),
    description: z.string().min(1).optional(),
    repository: z.string().min(1).optional(),
    stations: z.array(reference('stations')).default([]),
    surveys: z.array(reference('surveys')).default([]),
  }),
});

const people = defineCollection({
  loader: collection('people'),
  schema: common.extend({
    name: z.string().min(1),
    role: z.string().min(1),
    affiliation: z.string().optional(),
    profileUrl: z.url().optional(),
    portrait: mediaAsset.optional(),
    teamMembership: z.enum(['current', 'former']).optional(),
  }),
});

const partners = defineCollection({
  loader: collection('partners'),
  schema: common.extend({
    name: z.string().min(1),
    partnerType: z.enum(['research', 'network', 'community', 'infrastructure', 'funder', 'other']),
    url: z.url().optional(),
    logo: mediaAsset.optional(),
    country: z.string().min(1).optional(),
    collaborationFocus: z.string().min(1).optional(),
  }),
});

const funding = defineCollection({
  loader: collection('funding'),
  schema: common.extend({
    agency: reference('partners'),
    programme: z.string().min(1).optional(),
    projectTitle: z.string().min(1).optional(),
    startYear: z.number().int().min(1900).max(2100),
    endYear: z.number().int().min(1900).max(2100).optional(),
    grantNumber: z.string().min(1).optional(),
    url: z.url().optional(),
  }).refine((item) => item.programme || item.projectTitle, 'Funding must include a programme or project title.'),
});

const action = z.object({ label: z.string().min(1), href: z.string().min(1) });
const editorialSection = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
});
const aboutSection = editorialSection.omit({ text: true });
const pageBase = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  eyebrow: z.string().min(1),
  heroTitle: z.string().min(1),
  heroText: z.string().min(1),
});

const pages = defineCollection({
  loader: collection('pages'),
  schema: z.discriminatedUnion('pageType', [
    pageBase.extend({
      pageType: z.literal('home'),
      primaryCta: action,
      secondaryCta: action,
      network: editorialSection.extend({ actionLabel: z.string().min(1) }),
      pathway: editorialSection.extend({
        steps: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(3).max(6),
      }),
      findings: editorialSection.extend({ actionLabel: z.string().min(1) }),
      collaboration: editorialSection.extend({ action: action }),
    }),
    pageBase.omit({ heroText: true }).extend({
      pageType: z.literal('explore'),
      heroImage: mediaAsset,
    }),
    pageBase.extend({
      pageType: z.literal('research'),
      evidence: editorialSection,
    }),
    pageBase.extend({
      pageType: z.literal('resources'),
    }),
    pageBase.omit({ heroText: true }).extend({
      pageType: z.literal('about'),
      team: aboutSection.extend({ action }),
      partners: aboutSection,
      opportunities: aboutSection.extend({
        items: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).length(4),
      }),
      contact: z.object({ title: z.string().min(1), action: action }),
      funding: aboutSection,
    }),
  ]),
});

export const collections = {
  regions,
  stations,
  surveys,
  audio,
  visualizations,
  findings,
  publications,
  resources,
  people,
  partners,
  funding,
  pages,
};
