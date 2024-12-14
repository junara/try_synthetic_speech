<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  useDateFormat,
  useNow,
  useSpeechSynthesis,
  type UseSpeechSynthesisStatus,
  useStorage,
  useTimestamp,
} from '@vueuse/core'
import VoiceTable from '@/components/VoiceTable.vue'
import HistoryTable from '@/components/HistoryTable.vue'

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
const voices = ref<SpeechSynthesisVoice[]>([])
const voice = ref<SpeechSynthesisVoice>()
const elapsed = ref(0)
const timestamp = useTimestamp({ offset: 0 })
const startTime = ref(0)

interface HistoryItem {
  text: string
  voice: string | undefined
  status: UseSpeechSynthesisStatus
  time: string
  rate?: number
  pitch?: number
  elapsed?: number
}

const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')
const history = ref<HistoryItem[]>([])
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

watch(voice, (v) => {
  voiceURI.value = v?.voiceURI
})

const { speak, stop, status, isPlaying } = useSpeechSynthesis(text, {
  voice: voice.value || undefined,
  rate: rate,
  pitch: pitch,
})

const reset = () => {
  stop()
  rate.value = defaultRate
  pitch.value = defaultPitch
  text.value = defaultText
  voiceURI.value = defaultVoiceURI
  lang.value = defaultLang
  voice.value = filteredVoices.value[0]
  elapsed.value = 0
}

watch(status, (s) => {
  if (s === 'end') {
    elapsed.value = timestamp.value - startTime.value
  }
  history.value.unshift({
    text: text.value,
    voice: voice.value?.voiceURI,
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

const langs = computed(() => {
  return voices.value
    .map((v) => v.lang)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b))
})

const filteredVoices = computed(() => {
  return voices.value.filter((v) => v.lang === lang.value)
})

const onSpeak = () => {
  elapsed.value = 0
  startTime.value = timestamp.value
  speak()
}
const onStop = () => {
  stop()
}

const onChangeLang = () => {
  voice.value = filteredVoices.value[0]
}
</script>

<template>
  <header>
    <h1>Try synthetic speech</h1>
  </header>

  <main>
    <div>
      <label for="lang">Lang</label>
      <select id="lang" v-model="lang" @change="onChangeLang">
        <option v-for="l in langs" :key="l" :value="l">
          {{ l }}
        </option>
      </select>
      <label for="voice">Voice</label>
      <select id="voice" v-model="voice">
        <option v-for="v in filteredVoices" :key="v.name" :value="v">
          {{ v.name }}
        </option>
      </select>
      <label for="rate">Rate</label>
      <input id="rate" v-model="rate" type="number" min="0.1" max="10" step="0.1" />
      <label for="pitch">Pitch</label>
      <input id="pitch" v-model="pitch" type="number" min="0.1" max="10" step="0.1" />
      <label for="text"
        >Text <i v-if="text.length">{{ text.length }}</i></label
      >
      <textarea id="text" v-model="text" placeholder="Type something here" rows="4" cols="30" />
      <div>
        <button v-if="!isPlaying" :disabled="text.length === 0" @click="onSpeak">Speak</button>
        <button v-if="isPlaying" @click="onStop">Stop</button>
        <button v-if="!isPlaying" @click="reset">Reset</button>
        <span>{{ currentElapsed / 1000 }}</span> <span>sec</span>
      </div>
    </div>
    <figure>
      <HistoryTable v-if="history.length" :history="history" />
    </figure>
    <figure>
      <VoiceTable v-if="voices.length" :voices="voices" />
      <div v-else>Loading...</div>
    </figure>
  </main>
</template>

<style scoped></style>
