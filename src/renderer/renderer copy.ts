// import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'

// createApp(App).mount('#app')


import { createApp } from 'vue'
import SettingsComponent from './settings/settings-component.vue'

// createApp(SettingsComponent).mount('#app')

// import { VueEventChannels } from "./vue-event-channels";
// import { vueEventDispatcher } from "./vue-event-dispatcher";

const app = createApp({
    data() {
      return {
        // config: initialConfig,
        // translations: getTranslationSet(initialConfig.generalOptions.language),
      };
    },
    mounted() {
      // ... (event listeners and handlers)
  
    //   ipcRenderer.on(IpcChannels.autoCompleteResponse, (event: Electron.Event, updatedUserInput: string) => {
    //     vueEventDispatcher.$emit(VueEventChannels.autoCompletionResponse, updatedUserInput);
    //   });
    },
    methods: {
    //   mainWindowGlobalKeyPress(event: KeyboardEvent) {
    //     // ... (methods)
  
    //     if (event.key === "F5") {
    //       ipcRenderer.send(IpcChannels.indexRefreshRequested);
    //     }
    //   },
    },
});

// Register components
app.component("SettingsComponent", SettingsComponent);
// app.component("search-results", searchResultsComponent);

// Mount the app
app.mount("#app");

// // Add global keydown event listener
// // document.onkeydown = (event: KeyboardEvent) => {
// //     app.mainWindowGlobalKeyPress(event);
// // };