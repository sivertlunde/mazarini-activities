"use client"

import { MazariniUser } from "@/lib/db/databaseInterface"
import { FirebaseHelper } from "@/lib/db/firebaseHelper"
import { DiscordUser } from "@/types/user"
import { DiscordSDK } from "@discord/embedded-app-sdk"
import React, { createContext, useContext, useEffect, useState } from "react"

interface DiscordContextType {
  sdk: DiscordSDK | null
  discordUser: DiscordUser | null
  user: MazariniUser | null
  ready: boolean
}

const DiscordContext = createContext<DiscordContextType>({
  sdk: null,
  discordUser: null,
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
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null)
  const [user, setUser] = useState<MazariniUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let auth
    const clientID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string

    if (clientID) {
      setupDiscordSdk().then(() => {
        console.log("Discord SDK is authenticated")

        // We can now make API calls within the scopes we requested in setupDiscordSDK()
        // Note: the access_token returned is a sensitive secret and should be treated as such
      })
    } else {
      setTimeout(() => {
        setReady(true)
      }, 1000)
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
        setDiscordUser(discordUser)
        const firebase = new FirebaseHelper()
        const user = await firebase.getUser(discordUser?.id ?? "")
        setUser(user)
      }
      setSdk(discordSdk)
      setReady(true)
    }
  }, [])

  return (
    <DiscordContext.Provider value={{ sdk, discordUser, user, ready }}>
      {children}
    </DiscordContext.Provider>
  )
}

export function useDiscord() {
  return useContext(DiscordContext)
}
