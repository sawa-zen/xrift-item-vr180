/**
 * 開発環境用エントリーポイント
 *
 * ローカル開発時（npm run dev）に使用されます。
 * 本番ビルド（npm run build）では使用されません。
 */

import { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { RigidBody } from '@react-three/rapier'
import {
  DevEnvironment,
  TextInputProvider,
  createDefaultTextInputImplementation,
} from '@xrift/world-components'
import { Item } from './Item'

const Floor = () => (
  <RigidBody type="fixed" colliders="cuboid">
    <mesh receiveShadow position={[0, -0.05, 0]}>
      <boxGeometry args={[50, 0.1, 50]} />
      <meshStandardMaterial color="#444444" />
    </mesh>
  </RigidBody>
)

const App = () => {
  const textInputValue = useMemo(() => createDefaultTextInputImplementation(), [])
  return (
    <TextInputProvider value={textInputValue}>
      <DevEnvironment spawnPosition={[0, 1.6, 0.5]}>
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <Floor />
        <Item />
      </DevEnvironment>
    </TextInputProvider>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(<App />)
