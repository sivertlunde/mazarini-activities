import { useEffect } from "react"
import useParticipantStore from "../stores/participantStore"

export const useSyncParticipants = () => {
  const setParticipants = useParticipantStore(
    (state: { setParticipants: any }) => state.setParticipants
  )

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "participant-storage" && e.newValue) {
        const parsed = JSON.parse(e.newValue).state
        if (parsed?.participants) {
          setParticipants(parsed.participants)
        }
      }
    }

    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [setParticipants])
}
