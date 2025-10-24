"use client"

import { Button } from "@/components/styles"
import { useDiscord } from "@/providers/discordProvider"
import styles from "./page.module.css"

export default function Home() {
  const { sdk, user, ready } = useDiscord()

  if (!ready) return <p>Initializing Discord...</p>

  const handleSendMsg = async () => {
    console.log(sdk, sdk?.channelId)

    const response = await fetch("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelId: sdk?.channelId,
        content: "Sender mld som Høie, fra activity",
      }),
    })
    console.log(response)
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Button onClick={handleSendMsg}>Send test mld</Button>
      </main>
    </div>
  )
}
