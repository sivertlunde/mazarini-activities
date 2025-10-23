"use client"

import { Participants } from "@/components/Participants"
import { Wheel } from "@/components/Wheel"
import { useDiscord } from "@/providers/discordProvider"
import styles from "./page.module.css"

export default function Home() {
  const { sdk, user, ready } = useDiscord()

  if (!ready) return <p>Initializing Discord...</p>

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Wheel />
        <Participants />
      </main>
    </div>
  )
}
