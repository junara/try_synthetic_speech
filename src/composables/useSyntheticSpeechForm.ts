import { useStorage, useTimestamp, useDateFormat, useNow, useSpeechSynthesis } from '@vueuse/core'
import type { UseSpeechSynthesisStatus } from '@vueuse/core'
import { onMounted, ref, watch, computed } from 'vue'

export interface HistoryItem {
  text: string
  voice?: SpeechSynthesisVoice
  status: UseSpeechSynthesisStatus
  time: string
  rate: number
  pitch: number
  elapsed: number
}
const voices = ref<SpeechSynthesisVoice[]>([])
const history = ref<HistoryItem[]>([])

export const globalStore = () => {
  return {
    voices,
    history,
  }
}

export default function useSyntheticSpeechForm() {
  const defaultRate = 1
  const defaultPitch = 1
  const defaultText = 'Hello, World!'
  const defaultVoiceURI = null
  const defaultLang = 'en-US'
  const rate = useStorage<number>('rate', defaultRate)
  const pitch = useStorage<number>('pitch', defaultPitch)
  const text = useStorage<string>('text', defaultText)
  const voiceURI = useStorage<string>('voiceURI', defaultVoiceURI)
  const lang = useStorage<string>('lang', defaultLang)
  const voice = ref<SpeechSynthesisVoice>()
  const elapsed = ref(0)

  watch(voice, (v) => {
    voiceURI.value = v?.voiceURI
  })
  const loadVoices = () => {
    voices.value = window.speechSynthesis.getVoices()
    if (voices.value.length > 0) {
      voice.value = voices.value.find((v) => v.voiceURI === voiceURI.value) || voices.value[0]
    }
  }

  loadVoices()

  onMounted(() => {
    if (voices.value.length === 0) {
      // 音声リストがまだ初期化されていない場合に備える
      const intervalId = setInterval(() => {
        loadVoices()
        if (voices.value.length > 0) {
          clearInterval(intervalId) // 値を取得したら定期実行を停止
        }
      }, 100)

      // モダンブラウザ用のイベントリスナーを追加
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices()
        clearInterval(intervalId) // 値を取得後は停止（安全のため）
      }
    }
  })
  const langs = computed(() => {
    return voices.value
      .map((v) => v.lang)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a.localeCompare(b))
  })

  const initialVoiceURI = computed(() => {
    return filteredVoices.value[0] || voices.value[0]
  })

  const filteredVoices = computed(() => {
    return voices.value.filter((v) => v.lang === lang.value)
  })
  const onChangeLang = () => {
    voice.value = filteredVoices.value[0]
  }
  const reset = () => {
    stop()
    rate.value = defaultRate
    pitch.value = defaultPitch
    text.value = defaultText
    lang.value = defaultLang
    voice.value = initialVoiceURI.value
    voiceURI.value = initialVoiceURI.value?.voiceURI
    elapsed.value = 0
  }

  watch(voiceURI, () => {
    voice.value = voices.value.find((v) => v.voiceURI === voiceURI.value)
  })
  const timestamp = useTimestamp({ offset: 0 })
  const startTime = ref(0)

  const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')

  const { speak, stop, status, isPlaying } = useSpeechSynthesis(text, {
    voice: voice,
    rate: rate,
    pitch: pitch,
    lang: lang,
  })

  watch(status, (s) => {
    if (s === 'end') {
      elapsed.value = timestamp.value - startTime.value
    }
    history.value.unshift({
      text: text.value,
      voice: voice.value,
      status: s,
      time: formatted.value,
      rate: rate.value,
      pitch: pitch.value,
      elapsed: elapsed.value / 1000,
    })
  })

  const currentElapsed = computed(() => {
    if (isPlaying.value) {
      return timestamp.value - startTime.value
    } else {
      return elapsed.value
    }
  })

  const onSpeak = () => {
    elapsed.value = 0
    startTime.value = timestamp.value
    speak()
  }
  const onStop = () => {
    stop()
  }
  return {
    rate,
    pitch,
    text,
    voiceURI,
    lang,
    voice,
    elapsed,
    langs,
    filteredVoices,
    onChangeLang,
    reset,
    currentElapsed,
    onSpeak,
    onStop,
    isPlaying,
  }
}
