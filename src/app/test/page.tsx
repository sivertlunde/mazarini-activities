"use client"

import Scene from "@/components/scene/Scene"
import styles from "../page.module.css"

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Scene />
      </main>
    </div>
  )
}
