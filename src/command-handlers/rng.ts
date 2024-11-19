import type { ChatInputCommandInteraction } from 'discord.js'

export function handleRNGCommand(e: ChatInputCommandInteraction) {
  const min = e.options.getNumber('min')!
  const max = e.options.getNumber('max')!
  const range = max - min
  const random = Math.random() * (range + 1) + min
  return random
}
