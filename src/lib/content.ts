import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

/** Recover program topics when Astro's content cache predates the schema field. */
function resolveCourseProgram(entry: CollectionEntry<'courses'>): CollectionEntry<'courses'> {
  if (entry.data.program.length > 0) return entry;

  const frontmatter = entry.rendered?.metadata?.frontmatter as { program?: string[] } | undefined;
  if (!frontmatter?.program?.length) return entry;

  return {
    ...entry,
    data: {
      ...entry.data,
      program: frontmatter.program,
    },
  };
}

/** Site-wide settings singleton (contacts, socials, hero/footer/CTA copy). */
export async function getSiteSettings() {
  const entry = await getEntry('site-settings', 'site-settings');
  if (!entry) {
    throw new Error(
      'Missing src/content/site-settings/site-settings.yaml — this file is required for the site to build.'
    );
  }
  return entry.data;
}

export async function getCourses() {
  const entries = await getCollection('courses', ({ data }) => !data.draft);
  return entries.map(resolveCourseProgram).sort((a, b) => a.data.order - b.data.order);
}

export async function getReviews() {
  const entries = await getCollection('reviews', ({ data }) => !data.draft);
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getFaqItems() {
  const entry = await getEntry('faq', 'faq');
  return entry?.data.items ?? [];
}

export async function getLegalPages() {
  const entries = await getCollection('legal');
  return entries.sort((a, b) => a.data.order - b.data.order);
}
