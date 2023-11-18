// import { createApp } from 'vue'
// // import './style.css'
// import SettingsComponent from './settings/settings-component.vue'
// createApp(SettingsComponent).mount('#app')




import { createApp, ref, onMounted } from 'vue'
import SettingsComponent from './settings/settings-component.vue'
import { IpcChannels } from "../common/ipc-channels";

import mitt from 'mitt';                  // Import mitt
const emitter = mitt();                   // Initialize mitt


import { useIpcRenderer } from '@vueuse/electron'
// enable nodeIntegration if you don't provide ipcRenderer explicitly
// @see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
const ipcRenderer = useIpcRenderer()

const app = createApp(SettingsComponent);
// app.config.errorHandler = (err, vm, info) => {
//     ipcRenderer.send(`Vue error captured: ${err}, ${vm}, ${info}`);
// };




// app.provide('emitter', emitter);




app.mount('#app');


document.onkeydown = (event: KeyboardEvent) => {
    console.log("document.onkeydown");
    // alert("document.onkeydown");

    // Now you can use ipcRenderer here
    if (ipcRenderer) {
        if ((event.ctrlKey && event.key.toLowerCase() === "i") || (event.metaKey && event.key === ",")) {
            ipcRenderer.send(IpcChannels.openSettingsWindow);
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") {
            // vueEventDispatcher.$emit(VueEventChannels.focusOnInput);
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r") {
            ipcRenderer.send(IpcChannels.reloadApp);
        }

        if (event.key === "Escape") {
            ipcRenderer.send(IpcChannels.mainWindowHideRequested);
        }

        if (event.key === "F5") {
            alert("F5 pressed.")
            ipcRenderer.send(IpcChannels.indexRefreshRequested);
        }
    }
};

