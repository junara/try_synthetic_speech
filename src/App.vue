<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSpeechSynthesis, useStorage } from '@vueuse/core'
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
window.speechSynthesis.onvoiceschanged = () => {
  voices.value = window.speechSynthesis.getVoices()
  if (voices.value.length > 0) {
    voice.value = voices.value.find((v) => v.voiceURI === voiceURI.value) || voices.value[0]
  }
}
watch(voice, (v) => {
  voiceURI.value = v?.voiceURI
})
const { speak, stop } = useSpeechSynthesis(text, {
  voice: voice,
  rate: rate,
  pitch: pitch,
})
const reset = () => {
  rate.value = defaultRate
  pitch.value = defaultPitch
  text.value = defaultText
  voiceURI.value = defaultVoiceURI
  voice.value = voices.value[0]
}
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>Try synthetic speech</h1>
    </div>
  </header>

  <main>
    <div></div>
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
            /><span>{{ text.length }}</span>
          </div>
        </div>

        <div>
          <label for="rate">Rate</label>
          <input id="rate" type="number" min="0.1" max="10" step="0.1" v-model="rate" />
          <label for="pitch">Pitch</label>
          <input id="pitch" type="number" min="0.1" max="10" step="0.1" v-model="pitch" />
        </div>
      </div>
      <button @click="speak">Speak</button>
      <button @click="stop">Stop</button>
      <button @click="reset">Reset</button>
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
