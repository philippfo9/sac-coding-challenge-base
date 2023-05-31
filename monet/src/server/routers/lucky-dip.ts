import { z } from 'zod'
import { createRouter } from '../createRouter'

export const luckyDipRouter = createRouter()
  .query('getAll', {
    input: z.object({
      wallet: z.string()
    }),
    async resolve ({ ctx, input }) {}
  })
  .mutation('create', {
    input: z.object({
      wallet: z.string()
    }),
    async resolve ({ ctx, input }) {}
  })
  .mutation('update', {
    input: z.object({
      wallet: z.string()
    }),
    async resolve ({ ctx, input }) {}
  })
