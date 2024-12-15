<script setup lang="ts">
import VoiceTable from '@/components/VoiceTable.vue'
import HistoryTable from '@/components/HistoryTable.vue'
import useSyntheticSpeechForm, { globalStore } from '@/composables/useSyntheticSpeechForm.ts'
import SyntheticSpeechForm from '@/components/SyntheticSpeechForm.vue'
import { ref, watch } from 'vue'

const { history, voices } = globalStore()
const { langs } = useSyntheticSpeechForm()
const localLang = ref<string>('#')
watch(localLang, (lang) => {
  if (lang === '#') {
    return
  }
  location.href = `#${lang}`
})
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
    <p>Repository: https://github.com/junara/try_synthetic_speech</p>

    <section>
      <h2>Browser available voices in each lang</h2>
      <a href="#">Return to top</a>
      <label for="localLang">Navigation</label>
      <select id="localLang" v-model="localLang">
        <option v-for="(l, index) in langs" :key="index" :value="l">
          {{ l }}
        </option>
      </select>
      <template v-for="(lang, index) in langs" :key="index">
        <h3 :id="lang">{{ lang }}</h3>
        <a href="#">Return to top</a>
        <figure>
          <VoiceTable :voices="voices.filter((v) => v.lang === lang)" />
        </figure>
      </template>
    </section>

    <section>
      <h2>Browser available voices in one table</h2>
      <a href="#">Return to top</a>
      <details>
        <summary>Whole voices</summary>
        <figure>
          <VoiceTable v-if="voices.length" :voices="voices" />
          <div v-else>Loading...</div>
        </figure>
      </details>
    </section>
  </main>

  <footer>
    <a href="#">Return to top</a>
    <p>https://github.com/junara/try_synthetic_speech</p>
  </footer>
</template>

<style scoped></style>
