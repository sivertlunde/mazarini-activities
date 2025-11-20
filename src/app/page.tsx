"use client"

import { Wheel } from "@/components/luckyWheel/Wheel"
import { useDiscord } from "@/providers/discordProvider"
import styles from "./page.module.css"

export default function Home() {
  const { sdk, discordUser, ready } = useDiscord()

  if (!ready) return <p>Initializing Discord...</p>

  const getUser = async () => {
    const response = await fetch(`/api/firebase/user/${discordUser?.id ?? ""}`)
    console.log(response)
  }

  if (ready) getUser()

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Wheel />
      </main>
    </div>
  )
}
