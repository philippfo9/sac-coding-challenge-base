import {TRPCError} from "@trpc/server";
import {Transaction} from "@solana/web3.js";
import {validateAuthTx, verifySignature} from "./authUtils";
import {pub} from "../../../utils/solUtils";
import { solanaAuthConfig } from './authConfig';
import { isPlatformAdmin } from "../../techRaffles/services/UserService";

export function getWalletKeyFromContext(ctx: any): string {
  return ctx.req.headers.wallet as string;
}

export function validateTx(wallet: string, txSerialized: string) {
  if (!txSerialized) {
    throw new TRPCError({code: 'UNAUTHORIZED'})
  }

  const tx = Transaction.from(
    Buffer.from(JSON.parse(txSerialized))
  )

  if (!validateAuthTx(tx, pub(wallet))) {
    throw new TRPCError({code: 'UNAUTHORIZED'})
  }
}

export function validateSignature(wallet: string, signature: string) {
  const signatureArray = Array.from(JSON.parse(signature!).signature) as any

  if (
    !signature ||
    !verifySignature(
      wallet,
      signatureArray,
      solanaAuthConfig.signingMessage(wallet)
    )
  ) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
}

type t = {ctx: any, next: any}
export const userAuthedMiddleware = async ({ctx, next}: t) => {
  const txSerialized = ctx.req.headers.tx as string | undefined
  const signature = ctx.req.headers.signature as string | undefined
  const wallet = getWalletKeyFromContext(ctx);

  if (!wallet) {
    throw new TRPCError({code: 'UNAUTHORIZED'})
  }

  if (txSerialized) {
    validateTx(wallet, txSerialized)
  } else if (signature) {
    validateSignature(wallet, signature)
  } else {
    throw new TRPCError({code: 'UNAUTHORIZED'})
  }  

  return next()
}

export const userPlatformAdminMiddleware = async({ctx, next}: t) => {
  const wallet = getWalletKeyFromContext(ctx);

  if (!await isPlatformAdmin(wallet)) {
    throw new TRPCError({code: 'UNAUTHORIZED', message: 'You are not a platform admin.'});
  }

  return next();
}