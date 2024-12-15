import { computed, ref } from 'vue'

export default function useClientSpeechSynthesisVoice() {
  const voices = ref<SpeechSynthesisVoice[]>([])

  const loadVoices = () => {
    voices.value = window.speechSynthesis.getVoices()
  }

  const load = () => {
    if (voices.value.length === 0) {
      loadVoices()
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
    }
  }

  const reload = () => {
    voices.value = []
    load()
  }

  load()

  const langs = computed(() => {
    return voices.value
      .map((v) => v.lang)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a.localeCompare(b))
  })

  return {
    langs,
    reload,
    voices,
  }
}
