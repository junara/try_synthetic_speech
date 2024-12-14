<template>
  <table>
    <caption>
      History
    </caption>
    <thead>
      <tr>
        <th scope="col" role="columnheader">Time</th>
        <th scope="col" role="columnheader">Status</th>
        <th scope="col" role="columnheader">Text</th>
        <th scope="col" role="columnheader">Length</th>
        <th scope="col" role="columnheader">Voice</th>
        <th scope="col" role="columnheader">Elapsed</th>
        <th scope="col" role="columnheader">Rate</th>
        <th scope="col" role="columnheader">Pitch</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in history" :key="item.time">
        <td role="cell">
          {{ item.time }}
        </td>
        <td role="cell">
          {{ item.status }}
        </td>
        <td role="cell">
          {{ item.text }}
        </td>
        <td role="cell">
          {{ item.text.length }}
        </td>
        <td role="cell">
          {{ item.voice }}
        </td>
        <td role="cell">
          {{ item.elapsed }}
        </td>
        <td role="cell">
          {{ item.rate }}
        </td>
        <td role="cell">
          {{ item.pitch }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{
  history: {
    time: string
    status: string
    text: string
    voice: string
    elapsed: string
    rate: number
    pitch: number
  }[]
}>()
</script>
