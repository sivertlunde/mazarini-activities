import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface IReward {
  id: string
  name: string
  tickets: number
}

type RewardStore = {
  rewards: IReward[]
  addReward: (reward: IReward) => void
  removeReward: (id: string) => void
  updateReward: (reward: IReward) => void
  setRewards: (list: IReward[]) => void
}

const useRewardStore = create<RewardStore>()(
  persist(
    (set) => ({
      rewards: [],
      addReward: (reward: IReward) => {
        set((state) => ({
          rewards: [...state.rewards, reward],
        }))
      },
      removeReward: (id: string) => {
        set((state) => ({
          rewards: state.rewards.filter((p) => p.id !== id),
        }))
      },
      updateReward: (reward: IReward) => {
        set((state) => ({
          rewards: state.rewards
            .map((a) =>
              a.name === reward.name ? { ...a, tickets: a.tickets - 1 } : a
            )
            .filter((a) => a.tickets > 0),
        }))
      },
      setRewards: (list: IReward[]) => {
        set({ rewards: list })
      },
    }),
    {
      name: "reward-storage",
    }
  )
)

export default useRewardStore
