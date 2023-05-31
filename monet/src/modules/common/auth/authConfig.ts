export const solanaAuthConfig = {
  signingMessage: (address: string) => `Monet wants you verify this message from your address ${address} to prove the ownership of your wallet.\n
  By clicking Sign or Approve you are proving that you own this wallet and you are agreeing to the Terms of Service. This transaction will not be sent to the blockchain and wont incur any fees.`,
}
