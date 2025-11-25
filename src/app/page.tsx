"use client"

import { RewardWheel } from "@/components/luckyWheel/RewardWheel"
import { ILuckyWheelReward, MazariniUser } from "@/lib/db/databaseInterface"
import { useDiscord } from "@/providers/discordProvider"
import { useEffect, useState } from "react"
import { PacmanLoader } from "react-spinners"
import styles from "./page.module.css"

export default function Home() {
  const { discordUser, ready } = useDiscord()
  const [user, setUser] = useState<MazariniUser | null>(null)
  const [hasSpin, setHasSpin] = useState<boolean>(false)
  const [rewards, setRewards] = useState<ILuckyWheelReward[] | null>(null)

  const shuffleArray = (array: Array<ILuckyWheelReward>) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  useEffect(() => {
    if (ready && !user) {
      fetch(`/api/firebase/user/${discordUser?.id ?? ""}`).then((res) => {
        res.json().then((userObj) => {
          setUser(userObj)
          if (((userObj as MazariniUser)?.dailySpins ?? 0) >= 1) {
            setHasSpin(true)
          }
        })
      })
    }
    if (ready && !rewards) {
      fetch(`/api/firebase/luckywheel`).then((res) => {
        res.json().then((rewardList) => {
          setRewards(shuffleArray(rewardList))
        })
      })
    }
  }, [ready, user, rewards, discordUser])

  if (!ready || !user || !rewards)
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p style={{ marginBottom: 20 }}>2 sek...</p>
          <PacmanLoader color={"#fff"} />
        </main>
      </div>
    )

  if (ready && user && rewards && hasSpin) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <RewardWheel rewards={rewards} user={user} setHasSpin={setHasSpin} />
        </main>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p>Du har ikke flere lykkehjul spins</p>
      </main>
    </div>
  )
}
