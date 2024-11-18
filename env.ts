import { z } from 'zod'
import 'dotenv/config'

const schema = z.object({
  DISCORD_ACCESS_TOKEN: z.string(),
  CLIENT_ID: z.string(),
  SERVER_URL: z.string(),
  PING_INTERVAL: z.number(),
})
export const env = schema.parse(process.env)
