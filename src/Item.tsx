import { memo, useCallback, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useTextInputContext } from '@xrift/world-components'
import { Group, Vector3 } from 'three'
import { EyeView } from './components/EyeView'
import { AuroraShell } from './components/AuroraShell'
import { PortalMask } from './components/PortalMask'
import { ControlPanel } from './components/ControlPanel'
import { Pedestal, PEDESTAL_HEIGHT } from './components/Pedestal'
import { useHlsVideo } from './hooks/useHlsVideo'

const AUTO_PAUSE_DISTANCE = 12
const AUTO_RESUME_DISTANCE = 8
const _worldPos = new Vector3()


const DEFAULT_RADIUS = 5
const DEFAULT_SEGMENTS = 64

/** 動画テクスチャを半球に表示するコンポーネント */
const VideoSphere = memo(
  ({
    url,
    playing,
    volume = 1,
    radius = DEFAULT_RADIUS,
    segments = DEFAULT_SEGMENTS,
    placeholderColor = '#000000',
    onError,
    onBufferingChange,
  }: {
    url: string
    playing: boolean
    volume?: number
    radius?: number
    segments?: number
    placeholderColor?: string
    onError?: (error: Error) => void
    onBufferingChange?: (isBuffering: boolean) => void
  }) => {
    const { texture } = useHlsVideo({
      url,
      playing,
      volume,
      onError,
      onBufferingChange,
    })

    return (
      <>
        <EyeView texture={texture} eye="left" radius={radius} segments={segments} placeholderColor={placeholderColor} />
        <EyeView texture={texture} eye="right" radius={radius} segments={segments} placeholderColor={placeholderColor} />
      </>
    )
  }
)

VideoSphere.displayName = 'VideoSphere'

/**
 * 180度ステレオスコピック動画を半球に表示するコンポーネント
 *
 * HLS（.m3u8）形式のストリームに対応。
 * Side-by-Side形式のステレオ動画に対応し、
 * VRモードでは左目と右目に適切な映像を表示する。
 */
export const Item = memo(() => {
  const [userPlaying, setUserPlaying] = useState(false)
  const [farAway, setFarAway] = useState(false)
  const farAwayRef = useRef(false)
  const [volume, setVolume] = useState(0.5)
  const [url, setUrl] = useState('https://pub-7786abff6e7846e697d20fae2a06943b.r2.dev/index.m3u8')
  const [error, setError] = useState<string | null>(null)
  const portalGroupRef = useRef<Group>(null)

  const playing = userPlaying && !farAway

  useFrame(({ camera }) => {
    if (!portalGroupRef.current) return
    portalGroupRef.current.getWorldPosition(_worldPos)
    const distance = camera.position.distanceTo(_worldPos)

    let isFar = farAwayRef.current
    if (!isFar && distance > AUTO_PAUSE_DISTANCE) isFar = true
    if (isFar && distance < AUTO_RESUME_DISTANCE) isFar = false

    if (isFar !== farAwayRef.current) {
      farAwayRef.current = isFar
      setFarAway(isFar)
    }
  })

  const handleTogglePlay = useCallback(() => {
    setError(null)
    setUserPlaying((prev) => !prev)
  }, [])
  const handleVolumeUp = useCallback(() => setVolume((v) => Math.min(1, v + 0.25)), [])
  const handleVolumeDown = useCallback(() => setVolume((v) => Math.max(0, v - 0.25)), [])
  const handleError = useCallback((err: Error) => {
    setError(err.message)
    setUserPlaying(false)
  }, [])
  const { requestTextInput } = useTextInputContext()
  const handleUrlEdit = useCallback(() => {
    requestTextInput({
      id: 'video-url',
      placeholder: 'https://example.com/video/index.m3u8',
      initialValue: url,
      onSubmit: (value) => {
        if (value.trim()) {
          setUrl(value.trim())
          setUserPlaying(false)
          setError(null)
        }
      },
    })
  }, [url, requestTextInput])

  return (
    <group>
      <group ref={portalGroupRef} position={[0, PEDESTAL_HEIGHT + 0.01 + 2, 0]}>
        <PortalMask radius={2} segments={64} showPortal />
        {url && (
          <VideoSphere
            url={url}
            playing={playing}
            volume={volume}
            radius={500}
            segments={64}
            placeholderColor={'#000000'}
            onError={handleError}
            onBufferingChange={undefined}
          />
        )}
        {!playing && (
          <AuroraShell radius={500} segments={64} forceShow={!url || !!error} />
        )}
        {/* プレースホルダー / エラー表示 */}
        {(!url || error) && (
          <Text
            position={[0, 0, -1]}
            fontSize={0.2}
            color={error ? '#cc4444' : '#888888'}
            anchorX="center"
            anchorY="middle"
            maxWidth={3}
            textAlign="center"
          >
            {error ? `Error\n${error}` : 'URLを入力して\n再生してください'}
          </Text>
        )}
      </group>
      {/* 台座 */}
      <Pedestal />
      {/* 操作パネル */}
      <group position={[-2.8, 1, 0.5]} rotation={[0, Math.PI / 8, 0]}>
        <ControlPanel
          playing={playing}
          volume={volume}
          onTogglePlay={handleTogglePlay}
          onVolumeUp={handleVolumeUp}
          onVolumeDown={handleVolumeDown}
          onUrlEdit={handleUrlEdit}
          url={url}
        />
      </group>
    </group>
  )
})

Item.displayName = 'Item'
