import { useEffect, useRef, useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import { DoubleSide, type CylinderGeometry, type ShaderMaterial } from 'three'
import { simplexNoise3D } from '../shaders/simplexNoise3D'

export const PEDESTAL_HEIGHT = 0.15
const BOTTOM_RADIUS = 2.2
const TOP_RADIUS = 2.0

const vertexShader = /* glsl */ `
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
${simplexNoise3D}

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  float n1 = snoise(vPosition * 1.5) * 0.04;
  float n2 = snoise(vPosition * 4.0) * 0.02;
  float noise = n1 + n2;

  vec3 baseColor = vec3(0.2, 0.2, 0.2);
  vec3 stoneColor = baseColor + vec3(noise);

  float light = dot(vNormal, vec3(0.0, 1.0, 0.0)) * 0.3 + 0.7;

  gl_FragColor = vec4(stoneColor * light, 1.0);
}
`

const createUniforms = () => ({})

export const Pedestal = () => {
  const [uniforms] = useState(createUniforms)
  const materialRef = useRef<ShaderMaterial>(null)
  const geometryRef = useRef<CylinderGeometry>(null)

  useEffect(() => {
    const material = materialRef.current
    const geometry = geometryRef.current
    return () => {
      material?.dispose()
      geometry?.dispose()
    }
  }, [])

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh position={[0, PEDESTAL_HEIGHT / 2 + 0.01, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry ref={geometryRef} args={[TOP_RADIUS, BOTTOM_RADIUS, PEDESTAL_HEIGHT, 4]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          side={DoubleSide}
        />
      </mesh>
    </RigidBody>
  )
}
