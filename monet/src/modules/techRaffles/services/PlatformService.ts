import prisma from '../../../lib/prisma'

export const getGeneralMonetSettings = async () => {
  return await prisma.generalMonetSettings.findFirst()
}