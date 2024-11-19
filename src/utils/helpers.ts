import type { GuildMember } from 'discord.js'

export function getNickname(user: GuildMember) {
  return user.nickname || user.user.username
}
