"use client"

import { Participants } from "@/components/Participants"
import { Wheel } from "@/components/Wheel"
import styles from "../page.module.css"

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Wheel />
        <Participants />
      </main>
    </div>
  )
}
