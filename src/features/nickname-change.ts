import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  Message,
  TextChannel,
} from 'discord.js'

export const activeVotes = new Map<string, NicknameVoteTracker>()

class NicknameVoteTracker {
  private channel: TextChannel
  private voteMessage: Message
  private targetMember: GuildMember
  private newNickname: string
  private votingDuration: number
  private initiator: GuildMember

  private abortTimeout: () => void = () => {}

  constructor(
    channel: TextChannel,
    voteMessage: Message,
    targetMember: GuildMember,
    newNickname: string,
    votingDuration: number,
    initiator: GuildMember
  ) {
    this.channel = channel
    this.voteMessage = voteMessage
    this.targetMember = targetMember
    this.newNickname = newNickname
    this.votingDuration = votingDuration
    this.initiator = initiator
  }

  async startVoting() {
    // Set timeout for vote duration
    const timeout = setTimeout(async () => {
      await this.concludeVote()
    }, this.votingDuration * 1 * 1000)

    this.abortTimeout = () => clearTimeout(timeout)
  }

  async cancelVote(responsibleMember?: GuildMember) {
    this.abortTimeout()

    let content = 'Vote deleted.'

    if (responsibleMember) {
      content = `Vote deleted by <@${responsibleMember.id}>.`
    }
    try {
      this.channel.send(content)
    } catch (error) {
      console.error('Error canceling vote:', error)
    }
  }

  private async concludeVote() {
    try {
      // Fetch the most recent version of the message
      const fetchedMessage = await this.voteMessage.fetch()

      // Count reactions
      const approveReaction = fetchedMessage.reactions.cache.get('👍')
      const disapproveReaction = fetchedMessage.reactions.cache.get('👎')

      const approveCount = approveReaction
        ? (await approveReaction?.users.fetch()).size - 1
        : 0
      const disapproveCount = disapproveReaction
        ? (await disapproveReaction?.users.fetch()).size - 1
        : 0

      // Create conclusion embed
      const conclusionEmbed = new EmbedBuilder()
        .setAuthor({
          name: getNickname(this.targetMember),
          iconURL: this.targetMember.user.displayAvatarURL(),
        })
        .setTitle('Nickname Vote Concluded')
        .setDescription(
          `Votes for <@${this.targetMember.id}>'s nickname change`
        )
        .addFields(
          { name: '👍 Approve', value: approveCount.toString(), inline: true },
          {
            name: '👎 Disapprove',
            value: disapproveCount.toString(),
            inline: true,
          },
          {
            name: 'Result',
            value:
              approveCount > disapproveCount
                ? '✔️ Nickname Change Approved'
                : '❌ Nickname Change Rejected',
          }
        )
        .setFooter({
          iconURL: this.initiator.user.displayAvatarURL(),
          text: `Initiated by ${getNickname(this.initiator)}`,
        })

      // Change nickname if approved
      if (approveCount > disapproveCount) {
        await this.targetMember.setNickname(this.newNickname)
        conclusionEmbed.setColor('Green')
      } else {
        conclusionEmbed.setColor('Red')
      }

      // check if the message is already deleted
      await this.voteMessage.edit({ embeds: [conclusionEmbed] })

      // Remove reactions
      await this.voteMessage.reactions.removeAll()
    } catch (error) {
      console.error('Error concluding vote:', error)
    }
  }
}

export async function handleNicknameVoteCommand(
  interaction: ChatInputCommandInteraction
) {
  // Validate interaction
  if (!interaction.guild) {
    await interaction.reply({
      content: 'This command can only be used in a server.',
      ephemeral: true,
    })
    return
  }

  const channel = interaction.channel as TextChannel

  const initiator = interaction.member as GuildMember

  // Extract command options
  const targetMember = interaction.options.getMember('member') as GuildMember
  const newNickname = interaction.options.getString('nickname')
  const votingDuration = interaction.options.getInteger('voting-duration') || 5

  if (!targetMember || !newNickname) {
    await interaction.reply({
      content: 'Invalid member or nickname.',
      ephemeral: true,
    })
    return
  }

  if (targetMember.id === initiator.id) {
    await interaction.reply({
      content: "You can't change your own nickname.",
      ephemeral: true,
    })
    return
  }

  // Create vote embed
  const voteEmbed = new EmbedBuilder()
    .setTitle('Nickname Change Vote')
    .setDescription(
      `<@${initiator.id}> started a vote to change <@${targetMember.id}>'s nickname`
    )
    .setAuthor({
      name: getNickname(targetMember),
      iconURL: targetMember.user.displayAvatarURL(),
    })
    .setFields({ name: 'Proposed Nickname', value: newNickname, inline: true })
    .setFooter({ text: `Voting ends in ${votingDuration} minutes` })

  // Send initial vote message
  const voteMessage = (await interaction.reply({
    embeds: [voteEmbed],
    fetchReply: true,
  })) as Message

  // Add voting reactions
  await voteMessage.react('👍')
  await voteMessage.react('👎')

  // Start vote tracking
  const voteTracker = new NicknameVoteTracker(
    channel,
    voteMessage,
    targetMember,
    newNickname,
    votingDuration,
    initiator
  )
  console.log({ voteMessageID: voteMessage.id })
  activeVotes.set(voteMessage.id, voteTracker)

  voteTracker.startVoting()
}

function getNickname(user: GuildMember) {
  return user.nickname || user.user.username
}
