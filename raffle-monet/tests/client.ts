import path from 'path'
import { Intents } from 'discord.js'
import { Client } from 'discordx'

export const client = new Client({
  prefix: '!',
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  botGuilds: [
    (client: any) => client.guilds.cache.map((guild: any) => guild.id),
  ],
  silent: true,
  restRequestTimeout: 1000000,
} as any)
