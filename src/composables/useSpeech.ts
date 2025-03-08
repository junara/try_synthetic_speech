import {
  useDateFormat,
  useNow,
  useSpeechSynthesis,
  type UseSpeechSynthesisStatus,
  useTimestamp,
} from '@vueuse/core'
import { computed, ref, type Ref, watch } from 'vue'

export interface HistoryItem {
  text: string
  voice?: SpeechSynthesisVoice
  status: UseSpeechSynthesisStatus
  time: string
  rate: number
  pitch: number
  elapsed: number
}

export interface useSpeechSynthesisOptions {
  voice: Ref<SpeechSynthesisVoice>
  rate: Ref<number>
  pitch: Ref<number>
  lang: Ref<string>
}
const audioContext = new AudioContext()

// Web Audio APIを使って無音の音声を再生する
const playSilentAudio = () => {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  gainNode.gain.value = 1
  oscillator.start()

  // 0秒で再生（即座に停止）
  oscillator.stop(audioContext.currentTime + 0.5)
}

export default function useSpeech(text: Ref<string>, options: useSpeechSynthesisOptions) {
  const lastElapsedTime = ref(0)
  const startTime = ref(0)
  const timestamp = useTimestamp({ offset: 0 })
  const history = ref<HistoryItem[]>([])

  const { voice, rate, pitch, lang } = options
  const {
    speak: _speak,
    stop,
    status,
    isPlaying,
  } = useSpeechSynthesis(text, {
    voice: voice,
    rate: rate,
    pitch: pitch,
    lang: lang,
  })
  const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')

  watch(status, (s) => {
    if (s === 'end') {
      lastElapsedTime.value = elapsedTime.value
    }
    history.value.unshift({
      text: text.value,
      voice: voice.value,
      status: s,
      time: formatted.value,
      rate: rate.value,
      pitch: pitch.value,
      elapsed: lastElapsedTime.value / 1000,
    })
  })

  const elapsedTime = computed(() => timestamp.value - startTime.value)

  const currentElapsedTime = computed(() => {
    if (isPlaying.value) {
      return elapsedTime.value
    } else {
      return lastElapsedTime.value
    }
  })

  const speak = () => {
    lastElapsedTime.value = 0
    startTime.value = timestamp.value
    playSilentAudio()
    //   一秒後にならす
    setTimeout(() => {
      _speak()
    }, 1000)
  }

  const reset = () => {
    lastElapsedTime.value = 0
    stop()
  }

  return {
    currentElapsed: currentElapsedTime,
    elapsed: lastElapsedTime,
    history,
    isPlaying,
    reset,
    speak,
    status,
    stop,
  }
}
