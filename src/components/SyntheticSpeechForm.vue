<script setup lang="ts">
import useSyntheticSpeechForm from '@/composables/useSyntheticSpeechForm.ts'
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
  onSpeak,
  onStop,
  reset,
} = useSyntheticSpeechForm()
</script>
<template>
  <div>
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
    <textarea id="text" v-model="text" placeholder="Type something here" rows="4" cols="30" />
    <div>
      <button v-if="!isPlaying" :disabled="text.length === 0" @click="onSpeak">Speak</button>
      <button v-if="isPlaying" @click="onStop">Stop</button>
      <button v-if="!isPlaying" @click="reset">Reset</button>
      <span>{{ currentElapsed / 1000 }}</span>
      <span>sec</span>
    </div>
  </div>
</template>
