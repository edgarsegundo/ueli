import { createApp } from 'vue';
import UserInputComponent from './user-input-component.vue';

import mitt from 'mitt';                  // Import mitt
const emitter = mitt();                   // Initialize mitt

import { useIpcRenderer } from '@vueuse/electron'
import { IpcChannels } from "../common/ipc-channels";
import { createPinia } from 'pinia';

// // // enable nodeIntegration if you don't provide ipcRenderer explicitly
// // // @see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
const ipcRenderer = useIpcRenderer()

// import { IpcChannels } from "../common/ipc-channels";

window.onerror = function (message, source, lineno, colno, error) {
    // Handle the error here
    ipcRenderer.send(IpcChannels.remoteLog, `❌ ${message}`);
    console.error('Global Error:', message, source, lineno, colno, error);
    return true; // Prevent default error handling
};

window.addEventListener('unhandledrejection', event => console.error('Unhandled Promise Rejection:', event.reason));

const app = createApp(UserInputComponent);
// app.use(createPinia())

app.config.errorHandler = (err, instance, info) => {
    // alert(`${err}, info: ${info}`);
    if (!err) {
        err = "Generic error"
    }
    ipcRenderer.send(IpcChannels.remoteLog, `❌ ${err}`);
};

app.provide('emitter', emitter);
app.mount('#app');
