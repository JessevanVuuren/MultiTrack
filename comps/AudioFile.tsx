/* @jsxImportSource preact */
import { Button, Separator } from '@motion-canvas/ui'
import { useEffect, useState } from 'preact/hooks'
import { Audio, AudioFileProps } from '../types'
import { format_duration } from "../utils"
import { audio_polyline } from '../wave'
import { styles } from '../styles'


export const AudioFileComp: React.FC<AudioFileProps> = ({ audio, update_audio }) => {
	const [polyline, set_polyline] = useState("")
	const [loading, set_loading] = useState(true)

	const update_state = () => {
		const a: Audio = { ...audio, active: !audio.active }
		update_audio(a)

	}

	useEffect(() => {
		(async () => {
			set_polyline(audio_polyline(audio.buffer, 1000))
			set_loading(false)
		})()
	}, [])

	return <div style={styles.audio_file}>
		<svg style={styles.svg_polyline_file} viewBox="0 0 100 100" preserveAspectRatio="none">
			<polyline points={polyline} fill="none" stroke="rgba(255, 255, 255, 0.09)" strokeWidth={0.5} />
		</svg>
		<div style={styles.audio_file_padding}>
			<div style={styles.audio_file_container}>
				<p style={styles.audio_file_text}>{audio.name}</p>
				<div style={{ marginTop: 3 }}>
					{audio.active ?
						<Button loading={loading} onClick={update_state}>Deactivate</Button> :
						<Button loading={loading} onClick={update_state}>Activate</Button>
					}
				</div>
			</div>
			<Separator size={1} />
			<div style={styles.audio_file_container}>
				<div style={{ width: 10 }}>
					{audio.active ?
						<p style={{ ...styles.audio_file_text, color: "#14F06F", fontSize: 14 }}>ACTIVE</p> :
						<p style={{ ...styles.audio_file_text, color: "#E60158", fontSize: 14 }}>INACTIVE</p>
					}
				</div>
				<p style={styles.audio_duration}>{format_duration(audio.buffer.duration)}</p>
			</div>
		</div>

	</div>
}