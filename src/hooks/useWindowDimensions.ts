import { useEffect, useState } from "react"

export type WindowDimensions = {
  width: number | undefined
  height: number | undefined
}

const useWindowDimensions = (): WindowDimensions => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    function handleResize(): void {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Initialize dimensions on mount
    handleResize()

    // Add event listener for window resize
    window.addEventListener("resize", handleResize)

    // Clean up event listener on unmount
    return (): void => window.removeEventListener("resize", handleResize)
  }, []) // Empty dependency array ensures effect runs only once on mount

  return windowDimensions
}

export default useWindowDimensions
