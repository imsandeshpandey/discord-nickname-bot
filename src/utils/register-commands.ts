import { REST, Routes, SlashCommandBuilder } from 'discord.js'

export enum Command {
  Nickname = 'nickname',
}

export const commands = [
  new SlashCommandBuilder()
    .setName(Command.Nickname)
    .setDescription('Start a vote for nickname change')
    .addUserOption((option) =>
      option
        .setName('member')
        .setDescription('The member whose nickname is to be changed')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('nickname')
        .setDescription('The nickname to vote for')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('voting-duration')
        .setDescription(
          'The duration(minutes) for which the voting will be open. Defaults to 5 minutes.'
        )
        .setMinValue(1)
        .setMaxValue(60)
    )
    .toJSON(),
]

const rest = new REST({ version: '10' }).setToken(
  process.env.DISCORD_ACCESS_TOKEN!
)

export async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commands,
    })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}
