import { z } from 'zod';
import prisma from '../../../lib/prisma';
import { createRouter } from '../../../server/createRouter';
import { userPlatformAdminMiddleware } from '../../common/auth/authService';
import { getGeneralMonetSettings } from '../services/PlatformService';

const generalSettingId = 'clfi3dd5j00029kwf9i25w0kz'

export const platformRouter = createRouter()
  .middleware(userPlatformAdminMiddleware)
  .query('general-settings', {
    resolve: getGeneralMonetSettings
  })
  .mutation('update-general-settings', {
    input: z.object({
      generalDrawingHalted: z.boolean()
    }),
    resolve: async ({ input }) => {
      return await prisma.generalMonetSettings.update({
        data: {
          generalDrawingHalted: input.generalDrawingHalted
        },
        where: {
          id: generalSettingId
        }
      })
    }
  })