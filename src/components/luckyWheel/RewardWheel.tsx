import confetti from "canvas-confetti"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ILuckyWheelReward, MazariniUser } from "@/lib/db/databaseInterface"
import { useDiscord } from "@/providers/discordProvider"
import { Button } from "./styles"
import { capitalizeAndCut } from "./utils"

const Popup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(160deg, #1c1712, #2a2115);
  color: #f1e9d2;
  padding: 1.25rem 2.25rem;
  border-radius: 10px;
  border: 2px solid #c9a227;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.6), 0 0 40px rgba(201, 162, 39, 0.25);
  text-align: center;
  z-index: 1000;
  animation: popin 0.35s ease-out;

  h2 {
    color: #c9a227;
  }

  @keyframes popin {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.97);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`

// Hogwarts house colors — Gryffindor, Slytherin, Ravenclaw, Hufflepuff
const colors = ["#740001", "#1a472a", "#0e1a40", "#ecb939"]
const textColors = ["#f1e9d2", "#eef3ea", "#eef1fa", "#241c02"]

const lighten = (color: string, amount: number): string => {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const lr = Math.min(255, Math.round(r + (255 - r) * amount))
  const lg = Math.min(255, Math.round(g + (255 - g) * amount))
  const lb = Math.min(255, Math.round(b + (255 - b) * amount))
  return `#${((1 << 24) | (lr << 16) | (lg << 8) | lb).toString(16).slice(1)}`
}

const WheelFrame = styled.div`
  position: relative;
  border-radius: 50%;
  padding: clamp(10px, 1.6vw, 22px);
  background: radial-gradient(
    circle at 32% 30%,
    #f4d78c,
    #c9a227 45%,
    #7a5b12 75%,
    #3d2c07 100%
  );
  box-shadow: 0 0 0 4px #1c1305, 0 0 55px 12px rgba(201, 162, 39, 0.45),
    0 0 110px 35px rgba(116, 0, 1, 0.22), 0 0 110px 35px rgba(26, 71, 42, 0.18),
    inset 0 0 30px rgba(0, 0, 0, 0.65);
  animation: wheelGlow 4s ease-in-out infinite;

  @keyframes wheelGlow {
    0%,
    100% {
      box-shadow: 0 0 0 4px #1c1305, 0 0 55px 12px rgba(201, 162, 39, 0.45),
        0 0 110px 35px rgba(116, 0, 1, 0.22),
        0 0 110px 35px rgba(26, 71, 42, 0.18), inset 0 0 30px rgba(0, 0, 0, 0.65);
    }
    50% {
      box-shadow: 0 0 0 4px #1c1305, 0 0 70px 18px rgba(201, 162, 39, 0.6),
        0 0 130px 40px rgba(116, 0, 1, 0.3), 0 0 130px 40px rgba(26, 71, 42, 0.26),
        inset 0 0 30px rgba(0, 0, 0, 0.65);
    }
  }
`

const InnerRing = styled.div`
  border-radius: 50%;
  padding: clamp(4px, 0.8vw, 10px);
  background: linear-gradient(145deg, #241c02, #4a3608);
  line-height: 0;
`

interface RewardWheelProps {
  user: MazariniUser
  rewards: ILuckyWheelReward[]
  setHasSpin: (hasSpins: boolean) => void
}

export const RewardWheel = (props: RewardWheelProps) => {
  const { sdk } = useDiscord()
  const { user, rewards, setHasSpin } = props

  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)

  const [showPopup, setShowPopup] = useState(false)
  const [popupWinner, setPopupWinner] = useState<ILuckyWheelReward | null>(null)
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
  const [glowPulse, setGlowPulse] = useState(0)

  const { width, height } = useWindowDimensions()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const numSectors = rewards.reduce((sum, curr) => sum + curr.weight, 0)

  const getColor = (index: number, colorArray: string[]) => {
    let color = colorArray[index % colorArray.length]
    if (
      index === rewards.length - 1 &&
      colors[index % colors.length] === colors[0]
    )
      color = colorArray[1]
    return color
  }

  const drawWheel = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const radius = canvas.width / 2
    const sliceAngle = (2 * Math.PI) / numSectors

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.translate(radius, radius)
    ctx.rotate(-rotation * (Math.PI / 180))

    let startAngle = 0
    // Draw sectors
    for (let i = 0; i < rewards.length; i++) {
      const endAngle = (startAngle + rewards[i].weight * sliceAngle) % 360
      const isHighlighted = i === highlightIndex

      ctx.save()
      if (isHighlighted) {
        // Pulsing golden glow + brightened fill on the winning slice
        ctx.shadowColor = "rgba(244, 215, 140, 0.95)"
        ctx.shadowBlur = 25 + glowPulse * 25
      }
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = isHighlighted
        ? lighten(getColor(i, colors), 0.35 + glowPulse * 0.25)
        : getColor(i, colors)
      ctx.fill()
      if (isHighlighted) {
        ctx.lineWidth = 3
        ctx.strokeStyle = "#f4d78c"
        ctx.stroke()
      }
      ctx.restore()

      // Draw the name in the sector
      ctx.save()
      ctx.rotate((startAngle + endAngle) / 2)
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillStyle = getColor(i, textColors)
      ctx.font =
        rewards[i].weight / numSectors < 0.05
          ? "14px Helvetica"
          : "18px Helvetica"
      ctx.fillText(capitalizeAndCut(rewards[i].name) || "", radius * 0.9, 0)
      ctx.restore()
      startAngle = endAngle
    }

    ctx.rotate(rotation * (Math.PI / 180)) // Reset rotation
    ctx.translate(-radius, -radius)

    // Draw the static indicator
    const indicatorLength = 20
    const indicatorWidth = 10
    ctx.save()
    ctx.translate(canvas.width, canvas.height / 2)
    ctx.beginPath()
    ctx.moveTo(-indicatorLength, 0)
    ctx.lineTo(0, -indicatorWidth / 2)
    ctx.lineTo(0, indicatorWidth / 2)
    ctx.closePath()
    ctx.fillStyle = "#c9a227"
    ctx.fill()
    ctx.restore()
  }

  useEffect(() => {
    if (canvasRef.current) {
      drawWheel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards, rotation, width, height, highlightIndex, glowPulse])

  // Drives a slow pulsing glow on the winning slice for as long as it's highlighted
  useEffect(() => {
    if (highlightIndex === null) return
    let raf: number
    const start = performance.now()
    const loop = (now: number) => {
      const elapsed = now - start
      setGlowPulse((Math.sin(elapsed / 260) + 1) / 2)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [highlightIndex])

  const startSpin = () => {
    if (spinning || showPopup) return
    setSpinning(true)

    // Set the number of full rotations and calculate final rotation
    const numFullRotations = Math.random() * 5 + 5 // Between 5 and 10 full rotations
    const totalRotation = numFullRotations * 360
    const baseRotation = rotation

    // Anticipation: a quick pull backward first, like winding up before letting go,
    // then the real spin continues on from wherever that pull-back left off.
    const pullBackAngle = 10 + Math.random() * 6 // 10-16 degrees
    const pullBackDuration = 220
    const spinDuration = 6000
    const finalRotation = (baseRotation + pullBackAngle - totalRotation) % 360

    const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t)
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    let pullStartTime: number
    const animatePullBack = (time: number) => {
      if (!pullStartTime) pullStartTime = time
      const elapsed = time - pullStartTime
      const t = Math.min(elapsed / pullBackDuration, 1)
      setRotation(baseRotation + pullBackAngle * easeOutQuad(t))

      if (elapsed < pullBackDuration) {
        requestAnimationFrame(animatePullBack)
      } else {
        const spinStartRotation = baseRotation + pullBackAngle
        let spinStartTime: number
        const animateSpin = (spinTime: number) => {
          if (!spinStartTime) spinStartTime = spinTime
          const spinElapsed = spinTime - spinStartTime
          const spinT = Math.min(spinElapsed / spinDuration, 1)
          setRotation(spinStartRotation - totalRotation * easeOutCubic(spinT))

          if (spinElapsed < spinDuration) {
            requestAnimationFrame(animateSpin)
          } else {
            setSpinning(false)
            determineWinner(finalRotation)
          }
        }
        requestAnimationFrame(animateSpin)
      }
    }

    requestAnimationFrame(animatePullBack)
  }

  const determineWinner = (finalRotation: number) => {
    const sliceAngle = 360 / numSectors
    const normalizedRotation = ((finalRotation % 360) + 360) % 360

    const winningSector = Math.ceil(normalizedRotation / sliceAngle)
    const winnerIndex = getWinnerIndex(winningSector)
    const winner = rewards[winnerIndex]
    rewardWinner(winner)

    // Let the winning slice glow for a beat before the popup steals the spotlight
    setHighlightIndex(winnerIndex)
    setTimeout(() => {
      setPopupWinner(winner)
      setShowPopup(true)
    }, 1500)
  }

  const rewardWinner = async (reward: ILuckyWheelReward) => {
    await fetch(`/api/message/reward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        channelId: sdk?.channelId ?? "",
        reward: reward,
      }),
    })
  }

  const getWinnerIndex = (ticketNr: number) => {
    let currentTicket = 0
    let index = 0
    while (currentTicket < ticketNr) {
      currentTicket += rewards[index].weight
      index++
    }
    return index - 1
  }

  const startConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  useEffect(() => {
    if (showPopup) {
      startConfetti()
    }
  }, [showPopup])

  return (
    <>
      {/* <Header /> */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <WheelFrame>
          <InnerRing>
            <canvas
              ref={canvasRef}
              width={Math.min((width ?? 0) * 0.72, (height ?? 0) * 0.72)}
              height={Math.min((width ?? 0) * 0.72, (height ?? 0) * 0.72)}
              onClick={startSpin}
              style={{ borderRadius: "50%", display: "block" }}
            />
          </InnerRing>
        </WheelFrame>
        {/* <ButtonsContainer>
          <Button
            onClick={startSpin}
            disabled={rewards.length === 0 || spinning}
          >
            Spin
          </Button>
        </ButtonsContainer> */}
        {showPopup && popupWinner && (
          <Popup>
            <h2>Gratulerer</h2>
            <h3>
              Du har vunnet {popupWinner.description ?? popupWinner.name}!
            </h3>
            <Button
              onClick={() => {
                setShowPopup(false)
                setHighlightIndex(null)
                setHasSpin(false)
              }}
              disabled={rewards.length === 0 || spinning}
            >
              OK
            </Button>
          </Popup>
        )}
      </div>
    </>
  )
}
