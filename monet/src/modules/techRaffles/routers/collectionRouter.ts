import {z} from 'zod';
import {createRouter} from "../../../server/createRouter";
import prisma from "../../../lib/prisma";
import {collectionDefaultSelect} from "../services/selects/raffle";
import {getAllCollectionsPaginated, getAllCollectionsSearch} from "../services/CollectionService";
import {getProjectIdByPublicId} from "../services/ProjectService";

export const collectionRouter = createRouter()
  .query('search', {
    input: z.object({
      search: z.string(),
    }),
    resolve: async ({input}) => getAllCollectionsSearch(input.search),
  })
  .query('all', {
    input: z.object({
      page: z.number().min(0),
    }),
    resolve: ({input}) => getAllCollectionsPaginated(input.page),
  })
  .query('single', {
    input: z.object({
      name: z.string().min(1)
    }),
    async resolve({input}) {
      return prisma.nftCollection.findUnique({
        where: {name: input.name},
        select: collectionDefaultSelect,
        rejectOnNotFound: true
      })
    }
  })
  .query('project', {
    input: z.object({
      publicId: z.string().min(1)
    }),
    async resolve({input}) {
      return prisma.nftCollection.findMany({
        where: {
          projectId: await getProjectIdByPublicId(input.publicId)
        },
        orderBy: {
          averagePrice24hr: 'desc'
        },
        select: collectionDefaultSelect
      })
    }
  })