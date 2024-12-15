import { useStorage } from '@vueuse/core'
import { ref, watch, computed } from 'vue'
import useClientSpeechSynthesisVoice from '@/composables/useClientSpeechSynthesisVoice.ts'
import useSpeech, { type HistoryItem } from '@/composables/useSpeech.ts'

const { langs, voices } = useClientSpeechSynthesisVoice()
const history = ref<HistoryItem[]>([])

export const globalStore = () => {
  return {
    voices,
    history,
  }
}

export default function useSyntheticSpeechForm() {
  const defaultValue = {
    rate: 1,
    pitch: 1,
    text: 'Hello, World!',
    voiceURI: null,
    lang: null,
  }
  const rate = useStorage<number>('rate', defaultValue.rate)
  const pitch = useStorage<number>('pitch', defaultValue.pitch)
  const text = useStorage<string>('text', defaultValue.text)
  const voiceURI = useStorage<string>('voiceURI', defaultValue.voiceURI)
  const lang = useStorage<string>('lang', defaultValue.lang)

  const voice = computed(() => {
    return voices.value.find((v) => v.voiceURI === voiceURI.value)
  })

  const initialVoice = computed(() => {
    return filteredVoices.value[0] || voices.value[0]
  })

  const filteredVoices = computed(() => {
    return voices.value.filter((v) => v.lang === lang.value)
  })

  const onChangeLang = () => {
    voiceURI.value = filteredVoices.value[0]?.voiceURI
  }

  const reset = () => {
    resetSpeech()
    rate.value = defaultValue.rate
    pitch.value = defaultValue.pitch
    text.value = defaultValue.text
    lang.value = defaultValue.lang
    voiceURI.value = initialVoice.value?.voiceURI
  }

  const {
    currentElapsed,
    elapsed,
    history: _history,
    isPlaying,
    reset: resetSpeech,
    speak,
    stop,
  } = useSpeech(text, {
    voice: voice,
    rate: rate,
    pitch: pitch,
    lang: lang,
  })

  watch(
    _history,
    (h) => {
      history.value = h
    },
    { deep: true },
  )

  return {
    currentElapsed,
    elapsed,
    filteredVoices,
    isPlaying,
    lang,
    langs,
    onChangeLang,
    pitch,
    rate,
    reset,
    speak,
    stop,
    text,
    voice,
    voiceURI,
  }
}
