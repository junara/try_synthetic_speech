<template>
  <table>
    <caption>
      Available Voices
    </caption>
    <thead>
      <tr>
        <th scope="col" role="columnheader">Default</th>
        <th scope="col" role="columnheader">Local Service</th>
        <th scope="col" role="columnheader">Lang</th>
        <th scope="col" role="columnheader">URI</th>
        <th scope="col" role="columnheader">Name</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(voice, index) in voices" :key="index">
        <td role="cell">
          {{ voice?.default }}
        </td>
        <td role="cell">
          {{ voice?.localService }}
        </td>
        <td role="cell">
          {{ voice?.lang }}
        </td>
        <td role="cell">
          {{ voice?.voiceURI }}
        </td>
        <td role="cell">
          {{ voice?.name }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
defineProps<{
  voices: SpeechSynthesisVoice[]
}>()
</script>

<style scoped></style>
