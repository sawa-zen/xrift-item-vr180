import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, EqualStencilFunc, Vector3, type Mesh, type ShaderMaterial } from 'three'
import { simplexNoise3D } from '../shaders/simplexNoise3D'

interface AuroraShellProps {
  radius: number
  segments: number
  /** true の場合、距離に関係なく常に表示（URL未設定・エラー時） */
  forceShow?: boolean
}

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
${simplexNoise3D}

uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;
varying vec3 vPosition;

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 3; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

void main() {
  if (uOpacity < 0.01) discard;

  vec3 pos = normalize(vPosition);

  float n = fbm(pos * 2.0 + vec3(0.0, uTime * 0.08, uTime * 0.05));
  float n2 = fbm(pos * 3.0 + vec3(uTime * 0.06, 0.0, uTime * 0.04));

  float mix1 = smoothstep(-0.3, 0.6, n);
  float mix2 = smoothstep(-0.2, 0.5, n2);

  vec3 color = mix(uColor3, uColor1, mix1);
  color = mix(color, uColor2, mix2 * 0.5);

  float glow = smoothstep(-0.1, 0.8, n + n2) * 0.6 + 0.15;

  gl_FragColor = vec4(color * glow * uOpacity, 1.0);
}
`

const createUniforms = () => ({
  uTime: { value: 0 },
  uOpacity: { value: 1 },
  uColor1: { value: [0.0, 0.8, 0.7] },  // teal
  uColor2: { value: [0.8, 0.1, 0.6] },  // magenta
  uColor3: { value: [0.05, 0.05, 0.3] }, // deep blue
})

const _worldPos = new Vector3()

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

const FADE_NEAR = 6
const FADE_FAR = 12

export const AuroraShell = ({ radius, segments, forceShow = false }: AuroraShellProps) => {
  const [uniforms] = useState(createUniforms)
  const leftRef = useRef<Mesh>(null)
  const rightRef = useRef<Mesh>(null)
  const materialLeftRef = useRef<ShaderMaterial>(null)
  const materialRightRef = useRef<ShaderMaterial>(null)

  useEffect(() => {
    if (leftRef.current) {
      leftRef.current.layers.enable(0)
      leftRef.current.layers.enable(1)
    }
    if (rightRef.current) {
      rightRef.current.layers.set(2)
    }
  }, [])

  useFrame(({ camera }, delta) => {
    uniforms.uTime.value += delta

    if (forceShow) {
      uniforms.uOpacity.value = 1
    } else if (leftRef.current) {
      leftRef.current.getWorldPosition(_worldPos)
      const distance = camera.position.distanceTo(_worldPos)
      uniforms.uOpacity.value = smoothstep(FADE_NEAR, FADE_FAR, distance)
    }
  })

  const shaderProps = {
    uniforms,
    vertexShader,
    fragmentShader,
    side: BackSide,
    depthTest: false,
    depthWrite: false,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: EqualStencilFunc,
  } as const

  return (
    <>
      <mesh
        ref={leftRef}
        rotation={[0, Math.PI, 0]}
        scale={[-1, 1, 1]}
        renderOrder={-0.9}
      >
        <sphereGeometry args={[radius, segments, segments, 0, Math.PI]} />
        <shaderMaterial ref={materialLeftRef} {...shaderProps} />
      </mesh>
      <mesh
        ref={rightRef}
        rotation={[0, Math.PI, 0]}
        scale={[-1, 1, 1]}
        renderOrder={-0.9}
      >
        <sphereGeometry args={[radius, segments, segments, 0, Math.PI]} />
        <shaderMaterial ref={materialRightRef} {...shaderProps} />
      </mesh>
    </>
  )
}
