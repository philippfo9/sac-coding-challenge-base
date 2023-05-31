import {
  getDiscordAccessTokenByRefreshToken,
  getDiscordCurrentUserGuildMember,
  getDiscordCurrentUserGuilds
} from "../api/discordApi";
import prisma from "../../../lib/prisma";
import { ProjectHolderDiscordRoles } from '.prisma/client';
import reattempt from 'reattempt';
import {
  chunk,
  shuffle,
} from '../../../utils/utils';
import {whiten} from "@chakra-ui/theme-tools";

export const isUserHolderDBCheck = async (wallet: string, ...projectIds: string[]) => {
  console.log(`is user holder db check, wallet=${wallet}, projects len=`, projectIds.length, projectIds);
  
  return (await prisma.project.count({
    where: {
      verified: true,
      verifyHoldersBy: {
        not: 'DISABLED'
      },
      holders: {
        some: {
          wallet
        }
      },
      id: {
        in: projectIds
      }
    }
  })) === projectIds.length;
} 

export const removeAllHoldersFromUser = async (wallet: string) => prisma.user.update({
  where: {
    wallet
  },
  data: {
    holderInProjects: {
      set: []
    }
  }
})

export const checkAllEligableUsersForAllEligableProjects = async () => {
  const allUsers = await prisma.user.findMany({
    where: {
      discordRefreshToken: {
        not: null
      }
    },
    select: {
      wallet: true,
      name: true,
      discordRefreshToken: true,
      discordUsername: true
    },
  });

  const allUsersChunked = chunk(allUsers, 200);

  console.time('Check');
  console.log('User chunks: ', allUsersChunked.length);
  console.log('all users length', allUsers.length);

  await promiseAllInBatches((data, i) => processUsers(data), allUsersChunked, 5, 'users check');

  console.timeEnd('Check');
  console.log('all users length', allUsers.length);
  console.log('User chunks: ', allUsersChunked.length);
}

export const processUsers = async (users: {
  wallet: string,
  name: string,
  discordRefreshToken: string | null,
  discordUsername: string | null
}[]) => {
  console.log('chunked users length', users.length);

  const guildIdSortedUserChecks = [];
  let i = 0;
  for (const user of users) {
    guildIdSortedUserChecks.push(...(await getDiscordUserHolderChecks(user)));
    console.log(i);
    i++;
  }
  guildIdSortedUserChecks.sort((a, b) => a.guildId.localeCompare(b.guildId));

  const chunks = chunk(guildIdSortedUserChecks, 200);

  console.log('chunks size', chunks.length);
  console.log('chunk requests', guildIdSortedUserChecks.length);

  await promiseAllInBatches((data, i) => processDiscordChecks(shuffle(data), i), chunks, 3, 'discord checks');

  return guildIdSortedUserChecks.length;
}

/**
 * Same as Promise.all(items.map(item => task(item))), but it waits for
 * the first {batchSize} promises to finish before starting the next batch.
 *
 * @template A
 * @template B
 * @param {function(A): B} task The task to run for each item.
 * @param {A[]} items Arguments to pass to the task for each call.
 * @param {int} batchSize
 * @returns {Promise<B[]>}
 */
async function promiseAllInBatches<A>(task: (data: A, i: number) => Promise<unknown>, items: A[], batchSize: number, batchName: string) {
  let position = 0;
  while (position < items.length) {
    const itemsForBatch = items.slice(position, position + batchSize);
    console.log(`batch ${batchName} started`);
    await Promise.allSettled(itemsForBatch.map((item: A, i) => task(item, i)));
    console.log(`batch ${batchName} completed`);
    position += batchSize;
  }
}

export const processDiscordChecks = async (checks: Awaited<ReturnType<typeof getDiscordUserHolderChecks>>, i?: number) => {
  if (i !== undefined) {
    console.log(`=========== chunk ${i} started  ===========`)
  }

  for (const t of checks) {
    try {
      let isInAny = await discordHolderCheck(t.guildId, t.roles, t.userDiscordAccessToken, t.projectId, t.userName);

      const isDBHolder = await isUserHolderDBCheck(t.userWallet, t.projectId);

      if (!isInAny) {
        console.log(`x ${!isDBHolder ? 'Skipping ' : ''}Disconnecting user=${t.userName} as holder for project=${t.projectId}`);
        if (isDBHolder) {
          await prisma.user.update({
            where: {
              wallet: t.userWallet,
            },
            data: {
              holderInProjects: {
                disconnect: {
                  id: t.projectId
                }
              }
            }
          })
        }

      }

      if (isInAny) {
        console.log(`+ ${isDBHolder ? 'Skipping ' : ''}Connecting user=${t.userName} as holder for project=${t.projectId}`);
        if (!isDBHolder) {
          await prisma.user.update({
            where: {
              wallet: t.userWallet,
            },
            data: {
              holderInProjects: {
                connect: {
                  id: t.projectId
                }
              }
            }
          })
        }
      }
    } catch {
      console.log(`Discord holder check failed for user=${t.userName} for project=${t.projectId}; skipping it`);
    }
  }
  if (i !== undefined) {
    console.log(`=========== chunk ${i} finished ===========`)
  }
}


export const getDiscordUserHolderChecks = async (user: { wallet: string, name: string, discordRefreshToken: string | null, discordUsername: string | null }) => {
  let userDiscordAccessToken: string|undefined;
  try {
    userDiscordAccessToken = user.discordRefreshToken ? await getDiscordAccessTokenByRefreshToken(user.discordRefreshToken, user.wallet) : undefined;
  } catch {
    console.log('No discord access token found, aborting; user =', user.name, ' refreshToken=', user.discordRefreshToken, ' discordUsername=', user.discordUsername);
    return [];
  }

  if (!userDiscordAccessToken) {
    console.log('No discord access token found, aborting; user =', user.name, ' refreshToken=', user.discordRefreshToken, ' discordUsername=', user.discordUsername);
    return [];
  }

  const userGuildIds = (await getDiscordCurrentUserGuilds(userDiscordAccessToken)).map((guild) => guild.id);

  const projectsWithHolderVerificationWhereUserIsInDiscord = await prisma.project.findMany({
    where: {
      verified: true,
      verifyHoldersBy: {
        not: 'DISABLED'
      },
      discordGuildId: {
        in: userGuildIds
      }
    },
    select: {
      id: true,
      verifyHoldersBy: true,
      discordRoles: true,
      discordGuildId: true
    }
  });

  console.log('verifying user communities for user=', user.name, ' projects count=', projectsWithHolderVerificationWhereUserIsInDiscord.length);

  return projectsWithHolderVerificationWhereUserIsInDiscord.map(p => {
    return {
      guildId: p.discordGuildId!,
      roles: p.discordRoles,
      projectId: p.id,
      userName: user.name,
      userWallet: user.wallet,
      userDiscordAccessToken: userDiscordAccessToken!,
    }
  });
}

export const discordHolderCheck = async (projectGuildId: string, roles: ProjectHolderDiscordRoles[], userDiscordAccessToken: string, projectId: string, userName: string) => {
  let isInAny = false;

  const response = await reattempt.run({times: 20, delay: 26 * 1000}, async () => {
    const lResponse = await getDiscordCurrentUserGuildMember(projectGuildId, userDiscordAccessToken)

    if (lResponse.message?.includes('You are being rate limited.')) {
      console.log('Response for discord user=', userName, 'for project=', projectId, 'in guild=', projectGuildId, 'rate limited, retry after=', lResponse.retry_after);
      throw Error();
    }
    return lResponse;
  })

  if (response?.roles) {
    for (const role of roles) {
      if (response.roles.includes(role.roleId!)) {
        isInAny = true;
        break;
      }
    }
  }

  console.log('Response for discord user=', userName, 'for project=', projectId, 'in guild=', projectGuildId, 'match=', isInAny, 'responseRoles=', response.roles, 'projectHolderRoles=', roles.map(r => r.roleId));

  return isInAny;
}