export const userDefaultSelect = {
  id: true,
  wallet: true,
  name: true,
  profilePictureUrl: true,
  gradientStart: true,
  gradientEnd: true,
  twitterUsername: true,
  discordUsername: true,
  lastHolderCheck: true,
  hasBeenFlagged: true,
  hasBeenBanned: true,
  isTrustedRaffler: true,
  _count: {select: {createdRaffles: true}},
}
export const userAdminSelect = {
  ...userDefaultSelect,
  fundsWallet: true,
  twitterId: true,
  discordId: true,
  projects: {
    select: {
      project: {
        select: {
          publicId: true,
          id: true
        }
      },
      admin: true
    }
  }
}