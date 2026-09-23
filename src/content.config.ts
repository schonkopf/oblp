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
const observationType = z.enum(['acoustic', 'visual', 'environmental', 'multimodal']);
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
    region: reference('regions'),
    stationType: z.enum(['long-term', 'campaign', 'mobile']),
    habitat: z.string().optional(),
    depthM: z.number().nonnegative().optional(),
    coordinates: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
    monitoringPeriod: z.string().optional(),
    observationTypes: z.array(observationType).default(['acoustic']),
    ecosystem: z.string().optional(),
    methods: z.array(z.string()).default([]),
    media: mediaAsset.optional(),
  }),
});

const surveys = defineCollection({
  loader: collection('surveys'),
  schema: common.extend({
    region: reference('regions'),
    stations: z.array(reference('stations')).default([]),
    surveyType: z.enum(['spatial', 'temporal', 'experimental']),
    period: z.string().optional(),
    observationTypes: z.array(observationType).default(['acoustic']),
    ecosystem: z.string().optional(),
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
    file: z.string().optional(),
    spectrogram: mediaAsset.optional(),
    license: z.string().optional(),
  }).refine((item) => item.station || item.survey, 'Audio must reference a station or survey.'),
});

const visualizations = defineCollection({
  loader: collection('visualizations'),
  schema: common.extend({
    kind: z.enum(['figure', 'map', 'interactive', 'embedded-html']),
    station: reference('stations').optional(),
    survey: reference('surveys').optional(),
    source: z.string().optional(),
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
  }),
});

const partners = defineCollection({
  loader: collection('partners'),
  schema: common.extend({
    name: z.string().min(1),
    partnerType: z.enum(['research', 'community', 'infrastructure', 'funder', 'other']),
    url: z.url().optional(),
    logo: mediaAsset.optional(),
  }),
});

const site = defineCollection({
  loader: collection('site'),
  schema: z.object({
    title: z.string(),
    mission: z.string(),
    overview: z.string(),
    contactEmail: z.email(),
    contactInstitution: z.string(),
    capabilities: z.array(z.object({ title: z.string(), description: z.string() })),
    opportunities: z.array(z.object({ title: z.string(), description: z.string() })),
  }),
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
  site,
};
