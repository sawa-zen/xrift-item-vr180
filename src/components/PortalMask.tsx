import { useEffect, useRef } from 'react'
import {
  AlwaysStencilFunc,
  BackSide,
  Mesh,
  ReplaceStencilOp,
} from 'three'

interface PortalMaskProps {
  radius: number
  segments: number
}

/**
 * ステンシルバッファにのみ書き込むポータルマスク
 * この半球の形状が「窓」となり、窓越しにのみ巨大な映像球が見える
 */
export const PortalMask = ({ radius, segments }: PortalMaskProps) => {
  const leftRef = useRef<Mesh>(null)
  const rightRef = useRef<Mesh>(null)

  useEffect(() => {
    if (leftRef.current) {
      leftRef.current.layers.enable(0)
      leftRef.current.layers.enable(1)
    }
    if (rightRef.current) {
      rightRef.current.layers.set(2)
    }
  }, [])

  return (
    <>
      <mesh rotation={[0, Math.PI, 0]} scale={[-1, 1, 1]} ref={leftRef} renderOrder={-2}>
        <sphereGeometry args={[radius, segments, segments, 0, Math.PI]} />
        <meshBasicMaterial
          side={BackSide}
          colorWrite={false}
          depthWrite={true}
          stencilWrite={true}
          stencilRef={1}
          stencilFunc={AlwaysStencilFunc}
          stencilZPass={ReplaceStencilOp}
        />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} scale={[-1, 1, 1]} ref={rightRef} renderOrder={-2}>
        <sphereGeometry args={[radius, segments, segments, 0, Math.PI]} />
        <meshBasicMaterial
          side={BackSide}
          colorWrite={false}
          depthWrite={true}
          stencilWrite={true}
          stencilRef={1}
          stencilFunc={AlwaysStencilFunc}
          stencilZPass={ReplaceStencilOp}
        />
      </mesh>
    </>
  )
}
