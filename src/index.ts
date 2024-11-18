import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js'
import { env } from 'env'
import {
  activeVotes,
  handleNicknameVoteCommand,
} from './features/nickname-change'
import { Command, registerCommands } from './utils/register-commands'

registerCommands()

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
})

client.on(Events.ClientReady, async () => {
  console.log(`Logged inn as ${client.user?.tag}!`)
})

client.on(Events.InteractionCreate, async (e) => {
  if (!e.isCommand()) return

  switch (e.commandName) {
    case Command.Nickname:
      return handleNicknameVoteCommand(e as ChatInputCommandInteraction)
  }
})

client.on(Events.MessageDelete, async (message) => {
  if (!activeVotes.has(message.id)) return

  const voteTracker = activeVotes.get(message.id)

  voteTracker?.cancelVote()
})

client.login(env.DISCORD_ACCESS_TOKEN)
