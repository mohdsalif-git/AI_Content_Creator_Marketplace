import { z } from 'zod'

export const createBriefSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long'),
  contentType: z.string().min(1, 'Content type is required'),
  brandName: z.string().optional(),
  style: z.array(z.string()).optional().default(['Cinematic']),
  aspectRatio: z.array(z.string()).optional().default(['16:9']),
  platform: z.string().optional().default('Cross-platform'),
  usage: z.string().optional().default('Commercial · Global'),
  rights: z.record(z.any()).optional().default({
    commercialUsage: true,
    paidAds: true,
    license12Months: true,
    exclusive: false
  }),
  requiredTools: z.array(z.string()).optional().default([]),
  assetCount: z.number().int().positive().optional().default(3),
  budget: z.string().optional().default('$5k – $10k'),
  deadline: z.string().optional().default('Dec 15, 2026'),
  description: z.string().optional().default('')
})

export const sendBriefSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID is required'),
  notes: z.string().optional().default('')
})
