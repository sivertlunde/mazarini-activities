"use client"

import { DiscordUser } from "@/types/user"
import { DiscordSDK } from "@discord/embedded-app-sdk"
import React, { createContext, useContext, useEffect, useState } from "react"

interface DiscordContextType {
  sdk: DiscordSDK | null
  user: DiscordUser | null
  ready: boolean
}

const DiscordContext = createContext<DiscordContextType>({
  sdk: null,
  user: null,
  ready: false,
})

interface DiscordProviderProps {
  children: React.ReactNode
}

export const DiscordProvider: React.FC<DiscordProviderProps> = ({
  children,
}) => {
  const [sdk, setSdk] = useState<DiscordSDK | null>(null)
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [ready, setReady] = useState(false)

  const clientID = (process.env.DISCORD_CLIENT_ID as string) ?? ""
  useEffect(() => {
    let auth
    if (clientID) {
      console.log("has client id")

      setupDiscordSdk().then(() => {
        console.log("Discord SDK is authenticated")

        // We can now make API calls within the scopes we requested in setupDiscordSDK()
        // Note: the access_token returned is a sensitive secret and should be treated as such
      })
    }

    async function setupDiscordSdk() {
      const discordSdk = new DiscordSDK(clientID)
      await discordSdk.ready()
      console.log("Discord SDK is ready")

      // Authorize with Discord Client
      const { code } = await discordSdk.commands.authorize({
        client_id: clientID,
        response_type: "code",
        state: "",
        prompt: "none",
        scope: ["identify", "guilds", "applications.commands"],
      })

      // Retrieve an access_token from your activity's server
      const response = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      })
      const { access_token } = await response.json()

      // Authenticate with Discord client (using the access_token)
      auth = await discordSdk.commands.authenticate({
        access_token,
      })

      if (auth == null) {
        throw new Error("Authenticate command failed")
      } else {
        const discordUser = (await fetch(
          `https://discord.com/api/v10/users/@me`,
          {
            headers: {
              Authorization: `Bearer ${auth.access_token}`,
              "Content-Type": "application/json",
            },
          }
        ).then((response) => response.json())) as DiscordUser | null
        setUser(discordUser)
      }
      setSdk(discordSdk)
      setReady(true)
    }
  }, [])

  return (
    <DiscordContext.Provider value={{ sdk, user, ready }}>
      {children}
    </DiscordContext.Provider>
  )
}

export function useDiscord() {
  return useContext(DiscordContext)
}
