<script setup lang="ts">
import VoiceTable from '@/components/VoiceTable.vue'
import HistoryTable from '@/components/HistoryTable.vue'
import { globalStore } from '@/composables/useSyntheticSpeechForm.ts'
import SyntheticSpeechForm from '@/components/SyntheticSpeechForm.vue'

const { history, voices } = globalStore()
</script>

<template>
  <header>
    <h1>Try synthetic speech</h1>
  </header>

  <main>
    <SyntheticSpeechForm />
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
