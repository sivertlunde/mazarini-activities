import { ButtonHelper, LootType } from "./buttonHelper"
import {
  ILuckyWheelReward,
  LuckyWheelRewardType,
  MazariniUser,
} from "./db/databaseInterface"

export class RewardHelper {
  constructor() {}

  public async resolveReward(userId: string, reward: ILuckyWheelReward) {
    let text = ""
    let button = undefined
    const user = await this.getUser(userId)
    if (reward.type === LuckyWheelRewardType.chips) {
      user.chips += reward.amount ?? 0
      text = `Gratulerer med ${reward.amount ?? 0} chips, <@${user.id}>!`
    } else if (reward.type === LuckyWheelRewardType.shards) {
      user.ccg = { ...user.ccg, shards: (user.ccg?.shards ?? 0) + (reward.amount ?? 0) }
      text = `Gratulerer med ${reward.amount ?? 0} shards, <@${user.id}>!`
    } else if (reward.type === LuckyWheelRewardType.dond) {
      text = `<@${user.id}>`
      button = ButtonHelper.createDondButton(userId, reward.amount ?? 10)
    } else if (
      reward.type === LuckyWheelRewardType.chest ||
      reward.type === LuckyWheelRewardType.box ||
      reward.type === LuckyWheelRewardType.pack
    ) {
      text = `<@${user.id}>`
      button = ButtonHelper.createLootButton(
        userId,
        reward.quality ?? "basic",
        reward.type as LootType
      )
    }
    user.dailySpins = (user.dailySpins ?? 1) - 1
    this.updateUser(user)
    return this.getMessageBody(text, button)
  }

  private async updateUser(user: MazariniUser) {
    await fetch(
      `https://mazarini-activities.vercel.app/api/firebase/user/${user.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      }
    )
  }

  private async getUser(userId: string): Promise<MazariniUser> {
    const response = await fetch(
      `https://mazarini-activities.vercel.app/api/firebase/user/${userId}`
    )
    return (await response.json()) as MazariniUser
  }

  private getMessageBody(text: string, component?: object) {
    return {
      content: text,
      components: component ? [component] : undefined,
    }
  }
}
