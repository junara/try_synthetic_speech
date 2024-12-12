<template>
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
      <tr v-for="(voice, index) in voices" :key="index">
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
</template>

<script setup lang="ts">
defineProps<{
  voices: SpeechSynthesisVoice[]
}>()
</script>

<style scoped></style>
