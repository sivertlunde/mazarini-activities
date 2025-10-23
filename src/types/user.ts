export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null

  bot?: boolean
  system?: boolean
  mfa_enabled?: boolean
  locale?: string
  verified?: boolean
  email?: string | null

  flags?: number // User flags (bit-field)
  public_flags?: number // Public user flags (bit-field)

  premium_type?: number // Nitro subscription type
  accent_color?: number | null
  banner?: string | null

  global_name?: string | null
  avatar_decoration?: string | null // deprecated
  avatar_decoration_data?: any | null // details about avatar decoration
  collectibles?: any | null // user collectibles data
  primary_guild?: any | null // user's primary guild data
}
