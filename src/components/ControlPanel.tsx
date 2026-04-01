import { Container, Text } from '@react-three/uikit'

type ControlPanelProps = {
  playing: boolean
  volume: number
  onPlay: () => void
  onStop: () => void
  onVolumeUp: () => void
  onVolumeDown: () => void
}

export const ControlPanel = ({ playing, volume, onPlay, onStop, onVolumeUp, onVolumeDown }: ControlPanelProps) => {
  return (
    <Container
      sizeX={1.2}
      sizeY={2}
      pixelSize={0.005}
      flexDirection="column"
      gap={12}
      padding={20}
      backgroundColor={0x000000}
      opacity={0.7}
      borderRadius={12}
      alignItems="stretch"
    >
      <Button label={playing ? '⏸ Pause' : '▶ Play'} onClick={onPlay} />
      <Button label="■ Stop" onClick={onStop} />
      <Button label="🔉 Vol-" onClick={onVolumeDown} />
      <Button label="🔊 Vol+" onClick={onVolumeUp} />
      <Container paddingTop={4} alignItems="center" justifyContent="center">
        <Text fontSize={14} color={0xaaaaaa}>
          {`Vol: ${Math.round(volume * 100)}%`}
        </Text>
      </Container>
    </Container>
  )
}

const Button = ({ label, onClick }: { label: string; onClick: () => void }) => {
  return (
    <Container
      onClick={onClick}
      cursor="pointer"
      backgroundColor={0x333333}
      hover={{ backgroundColor: 0x555555 }}
      borderRadius={8}
      paddingY={10}
      paddingX={16}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={18} color={0xffffff}>
        {label}
      </Text>
    </Container>
  )
}
