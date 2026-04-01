import { memo, useCallback, useState } from 'react'
import { useTextInputContext } from '@xrift/world-components'
import { EyeView } from './components/EyeView'
import { PortalMask } from './components/PortalMask'
import { ControlPanel } from './components/ControlPanel'
import { useHlsVideo } from './hooks/useHlsVideo'

const DEFAULT_URL = 'https://pub-7786abff6e7846e697d20fae2a06943b.r2.dev/index.m3u8'

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
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [url, setUrl] = useState(DEFAULT_URL)

  const handleTogglePlay = useCallback(() => setPlaying((prev) => !prev), [])
  const handleVolumeUp = useCallback(() => setVolume((v) => Math.min(1, v + 0.25)), [])
  const handleVolumeDown = useCallback(() => setVolume((v) => Math.max(0, v - 0.25)), [])
  const { requestTextInput } = useTextInputContext()
  const handleUrlEdit = useCallback(() => {
    requestTextInput({
      id: 'video-url',
      placeholder: 'https://example.com/video/index.m3u8',
      initialValue: url,
      onSubmit: (value) => {
        if (value.trim()) {
          setUrl(value.trim())
          setPlaying(false)
        }
      },
    })
  }, [url, requestTextInput])

  return (
    <group>
      <group position={[0, 2, 0]}>
        <PortalMask radius={2} segments={64} />
        <VideoSphere
          url={url}
          playing={playing}
          volume={volume}
          radius={500}
          segments={64}
          placeholderColor={'#000000'}
          onError={undefined}
          onBufferingChange={undefined}
        />
      </group>
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
