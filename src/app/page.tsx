"use client"

import { useDiscord } from "@/providers/discordProvider"
import styles from "./page.module.css"

export default function Home() {
  const { sdk, user, ready } = useDiscord()

  if (!ready) return <p>Initializing Discord...</p>

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Mazarini Activities</h1>
        <h2>coming soon...</h2>
        <a href="/test">Ny side</a>
        <p>{user?.username}</p>
      </main>
    </div>
  )
}
