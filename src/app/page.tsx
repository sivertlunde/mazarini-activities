"use client"

import { RewardWheel } from "@/components/luckyWheel/RewardWheel"
import {
  ILuckyWheelReward,
  LootboxQuality,
  LuckyWheelRewardType,
  MazariniUser,
} from "@/lib/db/databaseInterface"
import { useDiscord } from "@/providers/discordProvider"
import { useEffect, useState } from "react"
import styles from "./page.module.css"

export default function Home() {
  const { discordUser, ready } = useDiscord()
  const [user, setUser] = useState<MazariniUser | null>(null)
  const [rewards, setRewards] = useState<ILuckyWheelReward[] | null>(
    mockRewards
  )

  // const getUser = () => {
  //   if (ready && !user) {
  //     fetch(`/api/firebase/user/${discordUser?.id ?? ""}`).then((res) => {
  //       res.json().then((userObj) => {
  //         setUser(userObj)
  //       })
  //     })
  //   }
  // }

  // const getRewards = () => {
  //   if (ready && !rewards) {
  //     fetch(`/api/firebase/luckywheel`).then((res) => {
  //       res.json().then((rewardList) => {
  //         setRewards(rewardList)
  //       })
  //     })
  //   }
  // }

  // useEffect(() => {
  //   if (ready) {
  //     getUser()
  //     getRewards()
  //   }
  // }, [ready])

  // const getUser = () => {
  //   fetch(`/api/firebase/user/${discordUser?.id ?? ""}`).then((res) => {
  //     res.json().then((userObj) => {
  //       setUser(userObj)
  //     })
  //   })
  // }

  // const getRewards = () => {
  //   fetch(`/api/firebase/luckywheel`).then((res) => {
  //     res.json().then((rewardList) => {
  //       setRewards(rewardList)
  //     })
  //   })
  // }

  useEffect(() => {
    if (ready && !user) {
      fetch(`/api/firebase/user/${discordUser?.id ?? ""}`).then((res) => {
        res.json().then((userObj) => {
          console.log("setter bruker", userObj)

          setUser(userObj)
        })
      })
    }
    // if (ready && !rewards) {
    //   fetch(`/api/firebase/luckywheel`).then((res) => {
    //     res.json().then((rewardList) => {
    //       setRewards(rewardList)
    //     })
    //   })
    // }
  }, [ready, user, /*rewards,*/ discordUser])

  if (!ready && !user && !rewards) return <p>Initializing Discord...</p>

  if (ready && user && rewards) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <RewardWheel rewards={rewards} user={user} />
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

const mockRewards: ILuckyWheelReward[] = [
  { name: "10K Dond", type: LuckyWheelRewardType.dond, amount: 10, weight: 1 },
  { name: "20K Dond", type: LuckyWheelRewardType.dond, amount: 20, weight: 1 },
  { name: "50K Dond", type: LuckyWheelRewardType.dond, amount: 50, weight: 1 },
  {
    name: "Chest",
    type: LuckyWheelRewardType.chest,
    quality: LootboxQuality.Basic,
    weight: 1,
  },
  {
    name: "Lootbox",
    type: LuckyWheelRewardType.box,
    quality: LootboxQuality.Basic,
    weight: 1,
  },
  {
    name: "500 chips",
    type: LuckyWheelRewardType.chips,
    amount: 500,
    weight: 3,
  },
  {
    name: "1000 chips",
    type: LuckyWheelRewardType.chips,
    amount: 1000,
    weight: 1,
  },
  {
    name: "5000 chips",
    type: LuckyWheelRewardType.chips,
    amount: 5000,
    weight: 1,
  },
]
