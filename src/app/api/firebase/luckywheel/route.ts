import { FirebaseHelper } from "@/lib/db/firebaseHelper"

export async function GET(request: Request) {
  const firebase = new FirebaseHelper()
  const storage = await firebase.getMazariniStorage()

  return Response.json(storage.luckyWheel)
}
