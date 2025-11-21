import { ButtonHelper } from "./buttonHelper"
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
      this.updateUser(user)
      text = `Gratulerer med ${reward.amount ?? 0} chips, <@${user.id}>!`
    } else if (reward.type === LuckyWheelRewardType.dond) {
      text = `<@${user.id}>`
      button = ButtonHelper.createDondButton(userId, reward.amount ?? 10)
    } else if (
      reward.type === LuckyWheelRewardType.chest ||
      reward.type === LuckyWheelRewardType.box
    ) {
      text = `<@${user.id}>`
      button = ButtonHelper.createLootButton(
        userId,
        reward.quality ?? "basic",
        reward.type === LuckyWheelRewardType.chest
      )
    }
    // else if (reward.type.substring(0, 6) === "effect") {
    // text = `<@${user.id}>`
    // button = ButtonHelper.createLootButton(userId, reward.quality ?? 'basic', reward.type === LuckyWheelRewardType.chest)
    // }
    return this.getMessageBody(text, button)
  }

  private async updateUser(user: MazariniUser) {
    await fetch(`/api/firebase/user/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
  }

  private async getUser(userId: string): Promise<MazariniUser> {
    const response = await fetch(`/api/firebase/user/${userId}`)
    return (await response.json()) as MazariniUser
  }

  private getMessageBody(text: string, component?: object) {
    return {
      content: text,
      components: component ? [component] : undefined,
    }
  }
}
