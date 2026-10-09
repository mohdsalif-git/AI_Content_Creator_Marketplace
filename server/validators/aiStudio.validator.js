import { z } from 'zod'

export const generateImageSchema = z.object({
  prompt: z
    .string({ required_error: 'Prompt is required' })
    .trim()
    .min(1, 'Prompt cannot be empty')
    .max(1000, 'Prompt cannot exceed 1000 characters'),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3']).optional().default('16:9'),
  style: z.string().max(100).optional().default('Cinematic')
})

export const generateVideoSchema = z.object({
  prompt: z
    .string({ required_error: 'Prompt is required' })
    .trim()
    .min(1, 'Prompt cannot be empty')
    .max(1000, 'Prompt cannot exceed 1000 characters'),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3']).optional().default('16:9'),
  duration: z.number().min(2).max(30).optional().default(5),
  imageUrl: z.string().optional()
})
