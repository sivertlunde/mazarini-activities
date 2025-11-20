import { FirebaseApp, initializeApp } from "firebase/app"
import {
  child,
  Database,
  get,
  getDatabase,
  increment,
  ref,
  remove,
  set,
  update,
} from "firebase/database"
import {
  FirebaseStorage,
  getBytes,
  getDownloadURL,
  getStorage,
  ref as storageRef,
  StorageReference,
  uploadBytes,
  UploadMetadata,
  UploadResult,
} from "firebase/storage"
import { database, firebaseConfig } from "../../../client-env"
import {
  BotData,
  DatabaseStructure,
  EmojiStats,
  MazariniStats,
  MazariniStorage,
  MazariniUser,
  Meme,
} from "./databaseInterface"

export class FirebaseHelper {
  private firebaseApp: FirebaseApp
  private db: Database
  private storage: FirebaseStorage

  constructor() {
    this.firebaseApp = initializeApp(firebaseConfig)
    this.db = getDatabase(this.firebaseApp)
    this.storage = getStorage(this.firebaseApp)
  }

  public async getStorageData(ref: StorageReference): Promise<ArrayBuffer> {
    return await getBytes(ref)
  }

  public async getStorageLink(ref: StorageReference): Promise<string> {
    return await getDownloadURL(ref)
  }

  public getStorageRef(path: string): StorageReference {
    return storageRef(this.storage, path)
  }

  public async uploadToStorage(
    ref: StorageReference,
    data: Buffer,
    meta?: UploadMetadata
  ): Promise<UploadResult> {
    return await uploadBytes(ref, data, meta)
  }

  public async saveData(data: DatabaseStructure) {
    if (data.bot) await this.saveBotData(data.bot)
    if (data.other) await this.saveMazariniStorage(data.other)
    if (data.users) await this.saveUsers(data.users)
  }

  public async saveUsers(users: MazariniUser[]) {
    await users.forEach((user) => this.saveUser(user))
  }

  public async saveUser(user: MazariniUser) {
    await set(ref(this.db, `${database}/users/${user.id}`), user)
  }

  public async saveBotData(data: BotData) {
    await set(ref(this.db, `${database}/bot`), data)
  }

  public async saveMazariniStorage(data: MazariniStorage) {
    await set(ref(this.db, `${database}/other`), data)
  }

  public async addTextCommands(name: string, data: string) {
    let texts = await this.getTextCommands(name)
    if (texts) texts.push(data)
    else texts = [data]
    set(ref(this.db, `${database}/textCommand/${name}`), texts)
  }

  public async getAllUsers(): Promise<MazariniUser[]> {
    return Object.values(await this.getData(`users`))
  }

  public async getUser(userId: string): Promise<MazariniUser> {
    return (await this.getData(`users/${userId}`)) as MazariniUser
  }

  public async getAllBotData(): Promise<BotData> {
    return (await this.getData(`bot`)) as BotData
  }

  public async getBotData(path: string): Promise<any> {
    return await this.getData(`bot/${path}`)
  }

  public async getMazariniStorage(): Promise<MazariniStorage> {
    return (await this.getData(`other`)) as MazariniStorage
  }

  public async getMemes(): Promise<Meme[]> {
    return (await this.getData(`memes`)) as Meme[]
  }

  public async getTextCommands(name: string): Promise<string[]> {
    return (await this.getData(`textCommand/${name}`)) as string[]
  }

  public async getMazariniStats(): Promise<MazariniStats> {
    return (await this.getData(`stats`)) as MazariniStats
  }

  public async getEmojiStats(name: string): Promise<EmojiStats> {
    return (await this.getData(`stats/emojis/${name}`)) as EmojiStats
  }

  public async getData(path: string): Promise<any> {
    const response = await get(child(ref(this.db), `${database}/${path}`))
    if (response.exists()) return response.val() as any
    // else {
    //     this.messageHelper?.sendLogMessage(`Prøvde å hente ${path}, men fant ingen data.`)
    //     return null
    // }
  }

  public updateData(updates: object) {
    update(ref(this.db, database), updates)
  }

  public updateUser(user: MazariniUser) {
    const updates: any = {}
    updates[`/users/${user.id}`] = user
    this.updateData(updates)
  }

  public incrementData(paths: string[], negative?: boolean) {
    const updates: any = {}
    paths.forEach((path) => {
      const num = paths.filter((x) => x === path).length
      updates[path] = increment(negative ? -num : num)
    })
    this.updateData(updates)
  }

  public async deleteData(path: string, customOrigin?: string) {
    await remove(ref(this.db, `${customOrigin ?? database}/${path}`))
  }
}
