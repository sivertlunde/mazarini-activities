export async function POST(request: Request) {
  const req = await request.json()

  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID as string,
      client_secret: process.env.DISCORD_CLIENT_SECRET as string,
      grant_type: "authorization_code",
      code: req.code,
    }),
  })

  // Retrieve the access_token from the response
  const { access_token } = await response.json()

  // Return the access_token to our client as { access_token: "..."}
  return Response.json({ access_token })
}
