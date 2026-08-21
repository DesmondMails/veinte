import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections cover everything the school owner needs to change
 * from Decap CMS (`/admin`) without touching code: course pricing/seats,
 * student reviews, FAQ, site-wide contact/social/CTA settings and the
 * legal pages. Purely structural/decorative copy (benefits tabs, learning
 * process steps…) lives in typed `src/data/*.ts` files instead — see
 * README for the full content-ownership breakdown.
 */

const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    icon: z.enum(['star', 'university', 'crown']).default('star'),
    iconVariant: z.enum(['light', 'dark', 'accent']).default('light'),
    currency: z.string().default('$'),
    priceCurrent: z.number(),
    priceOld: z.number(),
    seatsLeft: z.number().int().nonnegative(),
    ctaHref: z.string(),
    program: z.array(z.string()).default([]),
    order: z.number().int().default(0),
    draft: z.boolean().default(false),
  }),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reviews' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      photo: image(),
      photoAlt: z.string().optional(),
      pointA: z.string(),
      pointB: z.string(),
      order: z.number().int().default(0),
      draft: z.boolean().default(false),
    }),
});

const faq = defineCollection({
  loader: glob({ pattern: 'faq.yaml', base: './src/content/faq' }),
  schema: z.object({
    items: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
        openByDefault: z.boolean().default(false),
      })
    ),
  }),
});

const siteSettings = defineCollection({
  loader: glob({ pattern: 'site-settings.yaml', base: './src/content/site-settings' }),
  schema: z.object({
    siteName: z.string(),
    siteTagline: z.string(),
    contactEmail: z.email(),
    socials: z.object({
      instagram: z.url(),
      telegram: z.url(),
      tiktok: z.url(),
    }),
    hero: z.object({
      titleLine1: z.string(),
      titleLine2: z.string(),
      accentTitle: z.string(),
      description: z.string(),
      secondaryTitle: z.string(),
      secondaryAccent: z.string(),
      secondaryDescription: z.string(),
    }),
    ctaPrimary: z.object({
      label: z.string(),
      href: z.string(),
    }),
    ctaForm: z.object({
      title: z.string(),
      accentTitle: z.string(),
      description: z.string(),
      submitLabel: z.string(),
    }),
    footer: z.object({
      quote: z.string(),
      copyright: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    }),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    updatedDate: z.date().optional(),
    order: z.number().int().default(0),
  }),
});

export const collections = {
  courses,
  reviews,
  faq,
  'site-settings': siteSettings,
  legal,
};
