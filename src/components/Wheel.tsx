import confetti from "canvas-confetti"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

import { Header } from "./Header"
import useParticipantStore, { IParticipant } from "./stores/participantStore"
import { Button } from "./styles"
import { capitalize, capitalizeAndCut } from "./utils"

const Main = styled.main`
  display: flex;
  justify-content: space-around;
  padding: 20px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    align-items: center;
  }
`

const Popup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  color: #006400;
  padding: 1rem 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  text-align: center;
  z-index: 1000;
  animation: popin 1s ease-out;

  @keyframes popin {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5);
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

const colors = ["#f9ead4", "#11133c"]

const textColors = ["#010203", "#fcf8f3"]

export const Wheel = () => {
  const participants = useParticipantStore((state) => state.participants)
  const updateParticipant = useParticipantStore(
    (state) => state.updateParticipant
  )
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)

  const [showPopup, setShowPopup] = useState(false)
  const [popupWinner, setPopupWinner] = useState<IParticipant | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const numSectors = participants.reduce((sum, curr) => sum + curr.tickets, 0)

  const darkenColor = (color: string, amount: number): string => {
    let r = parseInt(color.slice(1, 3), 16)
    let g = parseInt(color.slice(3, 5), 16)
    let b = parseInt(color.slice(5, 7), 16)

    r = Math.max(0, r - amount)
    g = Math.max(0, g - amount)
    b = Math.max(0, b - amount)

    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
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
    for (let i = 0; i < participants.length; i++) {
      const endAngle = (startAngle + participants[i].tickets * sliceAngle) % 360
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      const color = darkenColor(
        i === 0 ? "#eb6381" : colors[i % colors.length],
        30
      )
      ctx.fillStyle = color
      ctx.fill()

      // Draw the name in the sector
      ctx.save()
      ctx.rotate((startAngle + endAngle) / 2)
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillStyle = darkenColor(textColors[i % colors.length], 30)
      ctx.font = numSectors > 50 ? "12px Arial" : "16px Arial"
      ctx.fillText(
        capitalizeAndCut(participants[i].name) || "",
        radius * 0.9,
        0
      )
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
    ctx.fillStyle = "red"
    ctx.fill()
    ctx.restore()

    // Draw a smaller center circle
    ctx.save()
    ctx.beginPath()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.arc(0, 0, radius / 10, 0, Math.PI * 2)
    ctx.fillStyle = darkenColor(colors[0], 30)
    ctx.fill()
    ctx.restore()
  }

  useEffect(() => {
    if (canvasRef.current) {
      drawWheel()
    }
  }, [participants, rotation])

  const startSpin = () => {
    if (spinning) return
    setSpinning(true)

    // Set the number of full rotations and calculate final rotation
    // eslint-disable-next-line react-hooks/purity
    const numFullRotations = Math.random() * 5 + 5 // Between 5 and 10 full rotations
    const totalRotation = numFullRotations * 360
    const finalRotation = (rotation - totalRotation) % 360

    const spinDuration = 6000
    const easing = (t: number) => {
      // Ease-out cubic
      return 1 - Math.pow(1 - t, 3)
    }

    let startTime: number

    const animate = (time: number) => {
      if (!startTime) startTime = time
      const elapsed = time - startTime
      const t = Math.min(elapsed / spinDuration, 1)
      const easeT = easing(t)
      const currentRotation = rotation - totalRotation * easeT

      setRotation(currentRotation)

      if (elapsed < spinDuration) {
        requestAnimationFrame(animate)
      } else {
        setSpinning(false)
        determineWinner(finalRotation)
      }
    }

    requestAnimationFrame(animate)
  }

  const determineWinner = (finalRotation: number) => {
    const sliceAngle = 360 / numSectors
    const normalizedRotation = ((finalRotation % 360) + 360) % 360

    const winningSector = Math.ceil(normalizedRotation / sliceAngle)
    const winner = getWinner(winningSector)

    setPopupWinner(winner)
    setShowPopup(true)
  }

  const getWinner = (ticketNr: number) => {
    let currentTicket = 0
    let index = 0
    while (currentTicket < ticketNr) {
      currentTicket += participants[index].tickets
      index++
    }
    return participants[index - 1]
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
      <Header />
      <Main>
        <div>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            onClick={startSpin}
            style={{ borderRadius: "50%", border: "2px solid black" }}
          />
          <ButtonsContainer>
            <Button
              onClick={startSpin}
              disabled={participants.length === 0 || spinning}
            >
              Spin
            </Button>
          </ButtonsContainer>
          {showPopup && popupWinner && (
            <Popup>
              <h2>Congratulations!</h2>
              <h3>{capitalize(popupWinner.name)}</h3>
              <Button
                onClick={() => {
                  updateParticipant(popupWinner)
                  setShowPopup(false)
                }}
                disabled={participants.length === 0 || spinning}
              >
                OK
              </Button>
            </Popup>
          )}
        </div>
      </Main>
    </>
  )
}
