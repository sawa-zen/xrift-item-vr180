import { Container, Text } from '@react-three/uikit'

type ControlPanelProps = {
  playing: boolean
  volume: number
  url: string
  onTogglePlay: () => void
  onVolumeUp: () => void
  onVolumeDown: () => void
  onUrlEdit: () => void
}

export const ControlPanel = ({ playing, volume, url, onTogglePlay, onVolumeUp, onVolumeDown, onUrlEdit }: ControlPanelProps) => {
  return (
    <Container
      sizeX={1.6}
      pixelSize={0.005}
      flexDirection="column"
      gap={12}
      padding={20}
      backgroundColor={0x000000}
      opacity={0.7}
      borderRadius={12}
      alignItems="stretch"
    >
      <Container alignItems="center" justifyContent="center" paddingBottom={4}>
        <Text fontSize={16} color={0xffffff} fontWeight="bold">
          VR180 Player
        </Text>
      </Container>
      {/* URL */}
      <Container flexDirection="row" gap={8} alignItems="center">
        <Button label="URL" onClick={onUrlEdit} />
        <Container flexGrow={1} overflow="hidden">
          <Text fontSize={10} color={0x888888}>
            {url.length > 40 ? `${url.slice(0, 40)}...` : url}
          </Text>
        </Container>
      </Container>
      {/* Play + Volume */}
      <Container flexDirection="row" gap={8} alignItems="center">
        <Button label={playing ? 'Pause' : 'Play'} flexGrow={1} onClick={onTogglePlay} />
        <Button label="-" onClick={onVolumeDown} />
        <Container alignItems="center" justifyContent="center" width={70}>
          <Text fontSize={14} color={0xaaaaaa}>
            {`Vol ${Math.round(volume * 100)}%`}
          </Text>
        </Container>
        <Button label="+" onClick={onVolumeUp} />
      </Container>
    </Container>
  )
}

const Button = ({ label, onClick, flexGrow }: { label: string; onClick: () => void; flexGrow?: number }) => {
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
      flexGrow={flexGrow}
    >
      <Text fontSize={18} color={0xffffff}>
        {label}
      </Text>
    </Container>
  )
}
