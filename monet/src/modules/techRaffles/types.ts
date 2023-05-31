import type {inferProcedureOutput} from '@trpc/server';
import type {AppRouter} from "../../server/routers/router";
import {z} from 'zod';
import {getRaffleOnChainData} from "./raffleOnChainUtils";
import { getAllUndrawnEndedRafflesOrPossiblySoldOut } from './services/RaffleService';

/**
 * Enum containing all api query paths
 */
export type TQuery = keyof AppRouter['_def']['queries']

export type InferQueryOutput<TRouteKey extends TQuery> = inferProcedureOutput<AppRouter['_def']['queries'][TRouteKey]>

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type allRafflesByProjectPublicIdType = InferQueryOutput<'raffle.all-by-project-public-id'>
export type raffleTypeWithLikeCount = NonNullable<InferQueryOutput<'raffle.single'>>
export type raffleType = Omit<raffleTypeWithLikeCount, "_count">
export type raffleMinType = NonNullable<ArrayElement<InferQueryOutput<'raffle.all'>>>;
export type projectType = NonNullable<InferQueryOutput<'project.single'>>
export type collectionType = NonNullable<InferQueryOutput<'collection.single'>>
export type collectionMinType = NonNullable<ArrayElement<InferQueryOutput<'collection.all'>>>
export type userType = NonNullable<InferQueryOutput<'user.get'>>
export type userSimpleType = NonNullable<InferQueryOutput<'user.get-simple'>>
export type memberType = NonNullable<InferQueryOutput<'project.community-members'>>
export type tokensType = NonNullable<InferQueryOutput<'token.getAll'>>
export type tokenType = ArrayElement<tokensType>
export type purchaseTokenType = raffleType['allowedPurchaseTokens'][0]
export type userCommunityMemberType = {
  name: string,
  profilePictureUrl: string,
  twitterUsername: string,
  wallet: string,
  gradientStart: string,
  gradientEnd: string,
  rafflesCount: number,
}

export type raffleProjectFilterType = 'ALL' | 'PROJECT' | 'USER' | 'COLLECTION' | 'NFT' | 'WL' | 'IRL';
export const raffleProjectFilterValidation = z.enum(['ALL', 'PROJECT', 'USER', 'COLLECTION', 'NFT', 'WL', 'IRL']);
export type raffleFilterType = 'NFT' | 'WL' | 'IRL' | 'ALL';
export const raffleFilterValidation = z.enum(['NFT', 'WL', 'IRL', 'ALL']);
export type raffleOrderByType = 'RECENTLY_ADDED' | 'ENDING_SOON' | 'FLOOR' | 'AVG24';
export const raffleOrderByValidation = z.enum(['RECENTLY_ADDED', 'ENDING_SOON', 'FLOOR', 'AVG24']);
export type raffleStatusType = 'FEATURED' | 'ALL' | 'ENDED';
export const raffleStatusValidation = z.enum(['FEATURED', 'ALL', 'ENDED']);

export type raffleUserConnectionType = 'ALL' | 'CREATED' | 'PARTICIPATED' | 'SAVED';
export const raffleUserConnectionValidation = z.enum(['ALL', 'CREATED', 'PARTICIPATED', 'SAVED']);

export type projectNavigationType = 'RAFFLES' | 'MEMBERS' | 'COLLECTIONS';
export const projectNavigationValidation = z.enum(['RAFFLES', 'MEMBERS']);

export type timeframeFilterType = 'ALLTIME' | 'WEEKLY' | 'MONTHLY';
export const timeframeFilterValidation = z.enum(['ALLTIME', 'WEEKLY', 'MONTHLY']);

export type OnChainRaffleType = Awaited<NonNullable<Awaited<ReturnType<typeof getRaffleOnChainData>>>>

export type endedRaffleType = Awaited<
  ReturnType<typeof getAllUndrawnEndedRafflesOrPossiblySoldOut>
>[0]