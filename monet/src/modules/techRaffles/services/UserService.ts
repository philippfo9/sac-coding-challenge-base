import prisma from "../../../lib/prisma";
import {userAdminSelect, userDefaultSelect} from './selects/user';
import {raffleDefaultSelect} from './selects/raffle';
import {getRandomGradient} from './GradientService';
import reattempt from "reattempt";
import axios from "axios";
import {projectDefaultSelect} from "./ProjectService";
import {getTwitterAccessTokenByRefreshToken, getTwitterProfilePicture} from "../api/twitterApi";

export const removeDiscordFromUser = (wallet: string) => prisma.user.update({
  where: {
    wallet
  },
  data: {
    discordId: null,
    discordUsername: null,
    discordRefreshToken: null
  }
})

export const removeTwitterFromUser = (wallet: string) => prisma.user.update({
  where: {
    wallet
  },
  data: {
    twitterId: null,
    twitterUsername: null,
    twitterRefreshToken: null
  }
})

export const likeRaffle = async (wallet: string, id: string) => prisma.user.update({
  where: {
    wallet
  },
  data: {
    likedRaffles: {
      connect: {
        id
      }
    }
  }
})

export const unlikeRaffle = async (wallet: string, id: string) => prisma.user.update({
  where: {
    wallet
  },
  data: {
    likedRaffles: {
      disconnect: {
        id
      }
    }
  }
})

export const userDetaultData = (wallet: string) => {
  const gradient = getRandomGradient();
  return {
    wallet,
    name: wallet,
    gradientStart: gradient.start,
    gradientEnd: gradient.end,
  }
}

export const getOrCreateUser = async (wallet: string) => {
  const user = await prisma.user.findUnique({
    where: {wallet},
    select: userAdminSelect,
    rejectOnNotFound: false
  })
  if (user) {
    return user;
  }
  return await prisma.user.create({
    data: userDetaultData(wallet),
    select: userAdminSelect
  })
}

export const getUserByWalletSafe = (wallet: string) => prisma.user.findUnique({
  where: {wallet},
  select: userDefaultSelect,
  rejectOnNotFound: true
})

export const getUserIdByWallet = async (wallet: string) => (await prisma.user.findUnique({
  select: {id: true},
  where: {wallet},
  rejectOnNotFound: true
})).id

export const getAllUserBySearch = (search: string) => {
  return prisma.user.findMany({
    where: {
      OR: [
        {
          name: {
            contains: search,
          }
        },
        {
          wallet: {
            contains: search
          }
        },
        {
          discordUsername: {
            contains: search
          }
        },
        {
          twitterUsername: {
            contains: search
          }
        }
      ],
      AND: [
        {
          twitterId: {
            not: null,
          },
          discordId: {
            not: null,
          },
        }
      ]
    },
    take: 4,
    select: {
      gradientStart: true,
      gradientEnd: true,
      wallet: true,
      name: true,
      profilePictureUrl: true,
      holderInProjects: {
        select: {
          communityName: true
        }
      }
    },
    orderBy: {
      createdRaffles: {
        _count: 'desc',
      },
    },
  })
}

export const isUserMemberOfProject = async (userId: string, projectId: string, wallet: string) => {
  const isUserMember = (await prisma.projectUsers.findFirst({
    where: {
      userId,
      projectId
    }
  })) != null;

  if (isUserMember) {
    return true
  }

  const isUserPlatformAdmin = await isPlatformAdmin(wallet)

  if (isUserPlatformAdmin) {
    console.log('Not member but platform admin, allowing temp, restricted access');
    return true
  }
  
  return false
}
  

export const isUserAdminOfProject = async (userId: string, projectId: string) =>
  (await prisma.projectUsers.findFirst({
    where: {
      userId,
      projectId,
      admin: true,
    }
  })) != null;

export const getUserCreatedProjectsCount = (userId: string) =>
  prisma.projectUsers.count({
    where: {
      userId,
      admin: true,
    }
  });

export const getLikedRaffles = async (wallet: string) => prisma.raffle.findMany({
  where: {
    likedBy: {
      some: {
        wallet
      }
    }
  },
  select: raffleDefaultSelect
})

export const isPlatformAdmin = async (wallet: string) =>  {
  return (await prisma.user.count({
    where: {
      wallet: wallet,
      platformAdmin: true
    }
  })) > 0;
}

export const checkTwitterPfps = async () => {
  const pfpUrls = await prisma.user.findMany({
    where: {
      profilePictureUrl: {
        startsWith: 'https://pbs.twimg.com'
      }
    },
    select: {
      wallet: true,
      name: true,
      profilePictureUrl: true,
      twitterRefreshToken: true,
      twitterUsername: true
    }
  });
  console.time('Check')
  console.log('pfps to check', pfpUrls.length);
  console.log('started at', new Date().toString());

  const usersToCheck = [];

  for (const pfp of pfpUrls) {
    try {
      await reattempt.run({times: 3, delay: 2 * 1000}, async () => {
        return (await axios.get<{}>(pfp.profilePictureUrl!));
      })
      await new Promise(r => setTimeout(r, 1000))
    } catch (e: any) {
      if (e?.response?.status === 404) {
        console.log('delete pfp user=', pfp.name, ' url=', pfp.profilePictureUrl)
        usersToCheck.push(pfp);
      } else {
        console.log('Error', e);
        console.log('Error response', e?.response);
        console.error('Unknown error, aborting twitter pfp clearing...');
        console.timeEnd('Check');
        return;
      }
    }
  }

  const usersToClear = [];

  console.log('PFPs to refresh', usersToCheck.length);
  for (const user of usersToCheck) {
    try {
      if (user.twitterRefreshToken && user.twitterUsername) {
        const twitterAccessToken = await getTwitterAccessTokenByRefreshToken(user.twitterRefreshToken, user.wallet);

        const pfp = await getTwitterProfilePicture(twitterAccessToken, user.twitterUsername);
        await prisma.user.update({
          where: {
            wallet: user.wallet,
          },
          data: {
            profilePictureUrl: pfp.profile_image_url?.replace('_normal', '_bigger')
          }
        })
      } else {
        usersToClear.push(user);
      }
    } catch {
      usersToClear.push(user);
    }
  }


  console.log('PFPs to clear', usersToClear.length);
  console.log('Running database update')
  await prisma.user.updateMany({
    where: {
      wallet: {
        in: usersToClear.map(u => u.wallet)
      }
    },
    data: {
      profilePictureUrl: null
    }
  })
  console.log('Running database update finished')
  console.timeEnd('Check');
  console.log('pfps tried to refresh', usersToCheck.length);
  console.log('pfps cleared', usersToClear.length);
  console.log('pfps checked', pfpUrls.length);
}