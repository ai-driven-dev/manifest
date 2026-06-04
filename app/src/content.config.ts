import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Optional free-text field that tolerates how contributors actually fill the
 * signatory template: an empty value, a left-in `# optional …` comment (YAML
 * parses that as null), or whitespace all collapse to `undefined` instead of
 * failing the build. Only a non-empty string is kept (and length-capped).
 */
const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined),
    z.string().max(max).optional(),
  );

const signatories = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/signatories' }),
  schema: z.object({
    github: z.string().regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/, {
      message: 'github must be a valid GitHub handle (alphanumeric + hyphen, max 39 chars)',
    }),
    name: z.string().min(1).max(120),
    linkedin: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined),
      z.string().url().optional(),
    ),
    affiliation: optionalText(120),
    // No `signed_on` field: the signature date is derived from the git commit
    // that added the file (scripts/gen-signature-dates.mjs → signature-dates.json),
    // so it cannot be backdated by editing the YAML.
    statement: optionalText(280),
  }),
});

export const collections = { signatories };
