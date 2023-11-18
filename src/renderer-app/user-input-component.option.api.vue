<script>
import { ref } from 'vue'
import { inject } from 'vue'

import { useIpcRenderer } from '@vueuse/electron'
import { IpcChannels } from "../common/ipc-channels";
// // enable nodeIntegration if you don't provide ipcRenderer explicitly
// // @see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
const ipcRenderer = useIpcRenderer()


export default {
  setup() {
    const count = ref(0)

    
    const emitter = inject('emitter'); // Inject `emitter`
    


    const send = () => {
      ipcRenderer.send(IpcChannels.remoteLog, "🦄 (2)");
        
      try {
        emitter.emit('myevent', 100);
      } catch (error) {
        ipcRenderer.send(IpcChannels.remoteLog, "🦄 (user-input-compnent.vue) error: " + error);
      }

      ipcRenderer.send(IpcChannels.remoteLog, "🦄 (3)");
    };

    // expose to template and other options API hooks
    return {
      send,
      count
    }
  },

  mounted() {
    console.log(this.count) // 0
    ipcRenderer.send(IpcChannels.remoteLog, "🦄 (1)");
  }
}
</script>

<template>
   <button @click="count++">{{ count }}</button>
   <button @click="send">send</button>
</template>





