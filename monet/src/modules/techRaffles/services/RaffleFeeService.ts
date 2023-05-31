import prisma from "../../../lib/prisma";

export const createRaffleFee = (raffleId: string, fee: number, text: string,) => prisma.raffleFee.create({
  data: {
    raffleId,
    fee,
    text
  }
})

export const getSumForRaffle = async (raffleId: string, ) => {
  const fees = await prisma.raffleFee.findMany({
    where: {
      raffleId
    }
  });
  let fee = 0;
  for (const feeModel of fees) {
    fee += feeModel.fee;
  }
  if (fee < 0.04) {
    fee = 0.04;
  }
  return fee;
}
