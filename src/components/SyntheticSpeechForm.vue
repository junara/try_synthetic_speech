<script setup lang="ts">
import useSyntheticSpeechForm from '@/composables/useSyntheticSpeechForm.ts'
import { ref, useTemplateRef, watch } from 'vue'
import { useFocus, useMagicKeys, whenever } from '@vueuse/core'
const { Ctrl_Enter, Meta_Enter } = useMagicKeys()
const {
  lang,
  langs,
  voiceURI,
  filteredVoices,
  rate,
  pitch,
  text,
  isPlaying,
  currentElapsed,
  onChangeLang,
  speak,
  stop,
  reset,
} = useSyntheticSpeechForm()

const errorMessages = ref<string[]>([])

const resetErrorMessages = () => {
  errorMessages.value = []
}
const onSpeak = () => {
  resetErrorMessages()
  if (!lang.value) {
    errorMessages.value.push('Please select Lang.')
  }
  if (!voiceURI.value) {
    errorMessages.value.push('Please select Voice.')
  }
  if (!rate.value || rate.value <= 0) {
    errorMessages.value.push('Please input Rate.')
  }
  if (!pitch.value || pitch.value <= 0) {
    errorMessages.value.push('Please input Pitch.')
  }
  if (!text.value || text.value.length === 0) {
    errorMessages.value.push('Please input Text.')
  }
  if (errorMessages.value.length > 0) {
    return
  }
  speak()
}
const onStop = () => {
  resetErrorMessages()
  stop()
}

const onReset = () => {
  resetErrorMessages()
  reset()
}
const input = useTemplateRef('my-input')
useFocus(input, { initialValue: true })

watch(
  () => lang.value,
  () => {
    resetErrorMessages()
  },
)

whenever(Meta_Enter, () => onSpeak())
whenever(Ctrl_Enter, () => onSpeak())
</script>
<template>
  <div>
    <ul v-if="errorMessages.length > 0" class="notice">
      <li v-for="(e, index) in errorMessages" :key="index">
        {{ e }}
      </li>
    </ul>
    <label for="lang">Lang</label>
    <select id="lang" v-model="lang" @change="onChangeLang">
      <option v-for="l in langs" :key="l" :value="l">
        {{ l }}
      </option>
    </select>
    <label for="voice">Voice</label>
    <select id="voice" v-model="voiceURI">
      <option v-for="v in filteredVoices" :key="v.name" :value="v.voiceURI">
        {{ v.voiceURI }}
      </option>
    </select>
    <label for="rate">Rate</label>
    <input id="rate" v-model="rate" type="number" min="0.1" max="10" step="0.1" />
    <label for="pitch">Pitch</label>
    <input id="pitch" v-model="pitch" type="number" min="0.1" max="10" step="0.1" />
    <label for="text"
      >Text <i v-if="text.length">{{ text.length }}</i></label
    >
    <textarea
      id="text"
      ref="my-input"
      v-model="text"
      placeholder="Type something here"
      rows="4"
      cols="30"
    />
    <div>
      <button v-if="!isPlaying" @click="onSpeak">Speak</button>
      <button v-if="isPlaying" @click="onStop">Stop</button>
      <button v-if="!isPlaying" @click="onReset">Reset</button>
      <span>{{ currentElapsed / 1000 }}</span>
      <span>sec</span>
    </div>
    <p>
      Speak by pressing <mark>Speak</mark> button or <kbd>Ctrl+Enter</kbd> or <kbd>Cmd+Enter</kbd>.
    </p>
  </div>
</template>
