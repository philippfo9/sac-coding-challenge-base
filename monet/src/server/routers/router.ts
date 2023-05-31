/**
 * This file contains the root router of your tRPC-backend
 */
import superjson from 'superjson'
import {createRouter} from '../createRouter'
import {projectRouter} from "../../modules/techRaffles/routers/projectRouter";
import {raffleRouter} from "../../modules/techRaffles/routers/raffleRouter";
import {userRouter} from "../../modules/techRaffles/routers/userRouter";
import {tokenRouter} from '../../modules/techRaffles/routers/tokenRouter';
import {collectionRouter} from "../../modules/techRaffles/routers/collectionRouter";
import { platformRouter } from '../../modules/techRaffles/routers/platformRouter';

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = createRouter()
  /**
   * Add data transformers
   * @link https://trpc.io/docs/data-transformers
   */
  .transformer(superjson)
  /**
   * Optionally do custom error (type safe!) formatting
   * @link https://trpc.io/docs/error-formatting
   */
  // .formatError(({ shape, error }) => { })
  .merge('project.', projectRouter)
  .merge('raffle.', raffleRouter)
  .merge('token.', tokenRouter)
  .merge('collection.', collectionRouter)
  .merge('user.', userRouter)
  .merge('platform.', platformRouter)

export type AppRouter = typeof appRouter
