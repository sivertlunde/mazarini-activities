import { Box, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"

const Scene = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Box>
        <meshStandardMaterial attach="material" color="orange" />
      </Box>
      <OrbitControls />
    </Canvas>
  )
}

export default Scene
