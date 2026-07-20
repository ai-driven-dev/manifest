import { PRINCIPLES } from '~/content/principles';
import { PREAMBLE } from '~/content/preamble';
import { VALUES } from '~/content/values';
import { ENTRY, RELATED_PRACTICES, VERSUS } from '~/content/lexicon';
import { absoluteUrl, SITE, stripHtml } from '~/lib/site';

export function getManifestoMarkdown(): string {
  const values = VALUES.map(
    (value) =>
      `## Value ${value.n}: ${value.left} over ${value.right}\n\n${value.body}`
  ).join('\n\n');

  const principles = PRINCIPLES.map(
    (principle) =>
      `## Principle ${principle.n}\n\n${stripHtml(principle.lead)}\n\n${principle.sub}`
  ).join('\n\n');

  const versus = VERSUS.map(
    (row) => `| ${row.axis} | ${row.aidd} | ${row.vibe} |`
  ).join('\n');

  return `# ${SITE.name}

${SITE.description}

Version ${SITE.version}

## Preamble

${stripHtml(PREAMBLE)}

## Definition

**${ENTRY.headword}** (${ENTRY.abbr}), ${ENTRY.pos} ${ENTRY.pron}

${stripHtml(ENTRY.def)}

Related practices: ${RELATED_PRACTICES.join(', ')}.

### AIDD vs vibe coding

| Axis | AIDD | Vibe coding |
| --- | --- | --- |
${versus}

# Values

${values}

# Principles

${principles}

## Sign

Signing is a public act recorded in the source repository. One YAML file, one pull request, no backend.

Repository: ${SITE.repoUrl}
Canonical URL: ${SITE.origin}/
`;
}

export function getManifestoJson() {
  return {
    name: SITE.name,
    description: SITE.description,
    version: SITE.version,
    url: absoluteUrl('/'),
    inLanguage: SITE.lang,
    datePublished: SITE.publishedDate,
    dateModified: SITE.modifiedDate,
    repository: SITE.repoUrl,
    relatedPractices: RELATED_PRACTICES,
    values: VALUES.map((value) => ({
      id: value.id,
      number: value.n,
      preferred: value.left,
      weighedAgainst: value.right,
      quadrant: value.quad,
      summary: value.body,
    })),
    principles: PRINCIPLES.map((principle) => ({
      id: `P-${principle.n}`,
      number: principle.n,
      statement: stripHtml(principle.lead),
      summary: principle.sub,
      frameworkTrace: principle.proof,
    })),
  };
}

export function getHomeJsonLd() {
  const manifesto = getManifestoJson();

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${absoluteUrl('/')}#website`,
      name: SITE.name,
      url: absoluteUrl('/'),
      inLanguage: SITE.lang,
      description: SITE.description,
      potentialAction: {
        '@type': 'ReadAction',
        target: absoluteUrl('/'),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${absoluteUrl('/')}#webpage`,
      url: absoluteUrl('/'),
      name: SITE.name,
      description: SITE.description,
      inLanguage: SITE.lang,
      datePublished: SITE.publishedDate,
      dateModified: SITE.modifiedDate,
      isPartOf: { '@id': `${absoluteUrl('/')}#website` },
      mainEntity: { '@id': `${absoluteUrl('/')}#manifesto` },
      breadcrumb: { '@id': `${absoluteUrl('/')}#breadcrumb` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${absoluteUrl('/')}#manifesto`,
      name: manifesto.name,
      description: manifesto.description,
      version: manifesto.version,
      url: manifesto.url,
      inLanguage: manifesto.inLanguage,
      datePublished: manifesto.datePublished,
      dateModified: manifesto.dateModified,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      sameAs: SITE.repoUrl,
      about: [
        'AI-assisted software development',
        'software engineering',
        'developer practice',
        ...manifesto.relatedPractices,
      ],
      hasPart: [
        ...manifesto.values.map((value) => ({
          '@type': 'DefinedTerm',
          '@id': `${absoluteUrl('/')}#${value.id}`,
          name: `${value.preferred} over ${value.weighedAgainst}`,
          description: value.summary,
          position: value.number,
        })),
        ...manifesto.principles.map((principle) => ({
          '@type': 'CreativeWork',
          '@id': `${absoluteUrl('/')}#${principle.id}`,
          name: `Principle ${principle.number}`,
          text: principle.statement,
          description: principle.summary,
          position: principle.number,
        })),
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      '@id': `${absoluteUrl('/')}#aidd`,
      name: ENTRY.headword,
      alternateName: [ENTRY.abbr],
      description: stripHtml(ENTRY.def),
      url: `${absoluteUrl('/')}#definition`,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        name: `${SITE.shortName} Lexicon`,
        url: `${absoluteUrl('/')}#definition`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${absoluteUrl('/')}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE.shortName,
          item: absoluteUrl('/'),
        },
      ],
    },
  ];
}
