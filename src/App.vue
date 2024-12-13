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

const defaultRate = 1
const defaultPitch = 1
const defaultText = 'Hello, World!'
const defaultVoiceURI = null
const rate = useStorage<number>('rate', defaultRate)
const pitch = useStorage<number>('pitch', defaultPitch)
const text = useStorage<string>('text', defaultText)
const voiceURI = useStorage<string>('voiceURI', defaultVoiceURI)
const voices = ref<SpeechSynthesisVoice[]>([])
const voice = ref<SpeechSynthesisVoice | null>(null)
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
  voice: voice,
  rate: rate,
  pitch: pitch,
})

const reset = () => {
  stop()
  rate.value = defaultRate
  pitch.value = defaultPitch
  text.value = defaultText
  voiceURI.value = defaultVoiceURI
  voice.value = voices.value[0]
  elapsed.value = 0
}

watch(status, (s) => {
  if (s === 'play') {
  } else if (s === 'end') {
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

const onSpeak = () => {
  elapsed.value = 0
  startTime.value = timestamp.value
  speak()
}
const onStop = () => {
  stop()
}
</script>

<template>
  <header>
    <div class="wrapper">
      <h3>Try synthetic speech</h3>
    </div>
  </header>

  <main>
    <div>
      <div>
        <div>
          <label for="voice">Voice</label>
          <div>
            <select id="voice" v-model="voice">
              <option v-for="v in voices" :key="v.name" :value="v">
                {{ v.name }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label for="text">Text</label>
          <div>
            <textarea
              id="text"
              v-model="text"
              placeholder="Type something here"
              rows="4"
              cols="50"
            />
            <div>
              <span>{{ text.length }}</span
              ><span>character number</span>
            </div>
            <div>
              <span>{{ currentElapsed / 1000 }}</span
              ><span>sec</span>
            </div>
          </div>
        </div>

        <div>
          <label for="rate">Rate</label>
          <input id="rate" type="number" min="0.1" max="10" step="0.1" v-model="rate" />
          <label for="pitch">Pitch</label>
          <input id="pitch" type="number" min="0.1" max="10" step="0.1" v-model="pitch" />
        </div>
      </div>
      <div>
        <button @click="onSpeak">Speak</button>
        <button @click="onStop">Stop</button>
        <button @click="reset">Reset</button>
      </div>
      <div>
        <div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Status</th>
                <th>Text</th>
                <th>Length</th>
                <th>Voice</th>
                <th>Elapsed</th>
                <th>Rate</th>
                <th>Pitch</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in history" :key="item.time">
                <td>
                  {{ item.time }}
                </td>
                <td>
                  {{ item.status }}
                </td>
                <td>
                  {{ item.text }}
                </td>
                <td>
                  {{ item.text.length }}
                </td>
                <td>
                  {{ item.voice }}
                </td>
                <td>
                  {{ item.elapsed }}
                </td>
                <td>
                  {{ item.rate }}
                </td>
                <td>
                  {{ item.pitch }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Default</th>
            <th>Local Service</th>
            <th>Lang</th>
            <th>URI</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {{ voice?.default }}
            </td>
            <td>
              {{ voice?.localService }}
            </td>
            <td>
              {{ voice?.lang }}
            </td>
            <td>
              {{ voice?.voiceURI }}
            </td>
            <td>
              {{ voice?.name }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>
      <VoiceTable v-if="voices.length" :voices="voices" />
      <div v-else>Loading...</div>
    </div>
  </main>
</template>

<style scoped></style>
