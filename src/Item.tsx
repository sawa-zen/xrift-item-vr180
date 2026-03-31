import { memo, useState } from 'react'
import { Interactable } from '@xrift/world-components'
import { EyeView } from './components/EyeView'
import { useHlsVideo } from './hooks/useHlsVideo'

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

  return (
    <group>
      <group position={[0, 2, 0]}>
        <VideoSphere
          url={'https://pub-7786abff6e7846e697d20fae2a06943b.r2.dev/index.m3u8'}
          playing={playing}
          volume={0}
          radius={2}
          segments={64}
          placeholderColor={'#000000'}
          onError={undefined}
          onBufferingChange={undefined}
        />
      </group>
      {/* Play ボタン */}
      <Interactable id="play-button" type="button" onInteract={() => setPlaying(true)} interactionText="Play">
        <mesh position={[-0.3, 0.3, 2.5]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color={playing ? '#666' : '#4CAF50'} />
        </mesh>
      </Interactable>
      {/* Stop ボタン */}
      <Interactable id="stop-button" type="button" onInteract={() => setPlaying(false)} interactionText="Stop">
        <mesh position={[0.3, 0.3, 2.5]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color={playing ? '#f44336' : '#666'} />
        </mesh>
      </Interactable>
    </group>
  )
})

Item.displayName = 'Item'
