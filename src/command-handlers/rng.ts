import { getNickname } from '@/utils/helpers'
import {
  EmbedBuilder,
  GuildMember,
  type ChatInputCommandInteraction,
} from 'discord.js'

export function handleRNGCommand(e: ChatInputCommandInteraction) {
  const min = e.options.getNumber('min')!
  const max = e.options.getNumber('max')!
  const range = max - min
  const random = (Math.random() * (range + 1) + min) >> 0

  const initiator = e.member! as GuildMember
  const embed = new EmbedBuilder()
    .setAuthor({
      name: getNickname(initiator),
      iconURL: initiator.displayAvatarURL(),
    })
    .setDescription(`Random Number Generator.`)
    .setTitle(String(random))
    .addFields(
      {
        name: 'Min',
        value: String(min),
        inline: true,
      },
      {
        name: 'Max',
        value: String(max),
        inline: true,
      }
    )

  e.reply({ embeds: [embed] })
}
