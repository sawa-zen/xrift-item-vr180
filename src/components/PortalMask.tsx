import { useEffect, useRef } from 'react'
import {
  AlwaysStencilFunc,
  BackSide,
  FrontSide,
  Mesh,
  ReplaceStencilOp,
} from 'three'

interface PortalMaskProps {
  radius: number
  segments: number
  showPortal?: boolean
}

/**
 * ステンシルバッファにのみ書き込むポータルマスク
 * この半球の形状が「窓」となり、窓越しにのみ巨大な映像球が見える
 * 外側は黒で描画し、背面カバーを兼ねる
 */
export const PortalMask = ({ radius, segments, showPortal = true }: PortalMaskProps) => {
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
      {showPortal ? (
        <>
          {/* ステンシル書き込み用（内側） */}
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
      ) : (
        /* URL未設定時: 内側を黒で塗りつぶす */
        <mesh rotation={[0, Math.PI, 0]} scale={[-1, 1, 1]}>
          <sphereGeometry args={[radius, segments, segments, 0, Math.PI]} />
          <meshStandardMaterial side={BackSide} color="#1a1a1a" />
        </mesh>
      )}
      {/* 背面カバー（外側から見た面を灰色で描画 + ステンシルを0にリセット） */}
      <mesh rotation={[0, Math.PI, 0]} scale={[-1, 1, 1]} renderOrder={-1.5}>
        <sphereGeometry args={[radius * 1.002, segments, segments, 0, Math.PI]} />
        <meshStandardMaterial
          side={FrontSide}
          color="#888888"
          stencilWrite={true}
          stencilRef={0}
          stencilFunc={AlwaysStencilFunc}
          stencilZPass={ReplaceStencilOp}
        />
      </mesh>
    </>
  )
}
