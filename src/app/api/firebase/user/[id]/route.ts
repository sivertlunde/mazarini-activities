import { FirebaseHelper } from "@/lib/db/firebaseHelper"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  if (!id)
    return new Response(JSON.stringify({ error: "Missing params" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })

  const firebase = new FirebaseHelper()
  const user = await firebase.getUser(id)

  return Response.json(user)
}

export async function PUT(req: Request) {
  const updatedUser = await req.json()

  if (!updatedUser)
    return new Response(JSON.stringify({ error: "Missing params" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  console.log("Oppdaterer bruker:", updatedUser.id)
  const firebase = new FirebaseHelper()
  firebase.updateUser(updatedUser)
  return Response.json({ success: true })
}
