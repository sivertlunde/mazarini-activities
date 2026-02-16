export class ButtonHelper {
  static createDondButton(userId: string, quality: number) {
    return {
      type: 1, // Action row
      components: [
        {
          type: 2, // Button
          label: `Deal or no Deal (${quality}K)`,
          style: 1,
          custom_id: `DEAL_OR_NO_DEAL_GAME;${userId};${quality}`,
        },
      ],
    }
  }

  static createLootButton(userId: string, quality: string, type: LootType) {
    return {
      type: 1, // Action row
      components: [
        {
          type: 2, // Button
          label: `Open loot ${type}`,
          style: 1,
          custom_id: `OPEN_LOOT;${userId};${quality};${type};`,
        },
      ],
    }
  }

  static createEffectButton(userId: string, quality: 10 | 20 | 50) {
    return {
      type: 1, // Action row
      components: [
        {
          type: 2, // Button
          label: `Effect TBD`,
          style: 1,
          custom_id: `DEAL_OR_NO_DEAL_GAME;${userId};${quality}`,
        },
      ],
    }
  }
}

export type LootType = "box" | "chest" | "pack"
