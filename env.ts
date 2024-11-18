import { z } from 'zod'
import 'dotenv/config'

const schema = z.object({
  DISCORD_ACCESS_TOKEN: z.string(),
  CLIENT_ID: z.string(),
})
export const env = schema.parse(process.env)
