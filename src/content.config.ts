import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(), theme: z.string(), number: z.string(),
    status: z.enum(['Current', 'Completed', 'To be confirmed']),
    summary: z.string(), methods: z.array(z.string()), featured: z.boolean().default(false),
  }),
});
export const collections = { projects };
