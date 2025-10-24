export async function POST(request: Request) {
  const req = await request.json()

  if (!(req.body?.channelId && req.body?.content))
    return new Response(JSON.stringify({ error: "Missing params" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })

  const { channelId, content } = req.body
  // Now you can safely post to Discord using your bot token
  const restResp = await fetch(
    `https://discord.com/api/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }
  )

  if (!restResp.ok) {
    console.error(await restResp.text())
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
  return new Response(JSON.stringify({ message: "Created!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
