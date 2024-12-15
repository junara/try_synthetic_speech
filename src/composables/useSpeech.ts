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
    _speak()
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
