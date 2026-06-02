import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const signatories = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/signatories' }),
  schema: z.object({
    github: z.string().regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/, {
      message: 'github must be a valid GitHub handle (alphanumeric + hyphen, max 39 chars)',
    }),
    name: z.string().min(1).max(120),
    linkedin: z.string().url().optional(),
    affiliation: z.string().max(120).optional(),
    // No `signed_on` field: the signature date is derived from the git commit
    // that added the file (scripts/gen-signature-dates.mjs → signature-dates.json),
    // so it cannot be backdated by editing the YAML.
    statement: z.string().max(280).optional(),
  }),
});

export const collections = { signatories };
