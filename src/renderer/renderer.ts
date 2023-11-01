import Vue from "vue";
import { settingsComponent } from "./settings/settings-component";
import { defaultUserConfigOptions } from "../common/config/user-config-options";
import { ElectronStoreConfigRepository } from "../common/config/electron-store-config-repository";
import { deepCopy } from "../common/helpers/object-helpers";

Vue.component("settings", settingsComponent);

const initialConfig = new ElectronStoreConfigRepository(deepCopy(defaultUserConfigOptions)).getConfig();

const app = new Vue({
    data: {
        config: initialConfig,
    },
    el: "#app",
    mounted() {
    },
    methods: {
        mainWindowGlobalKeyPress(event: KeyboardEvent) {
            // if ((event.ctrlKey && event.key.toLowerCase() === "i") || (event.metaKey && event.key === ",")) {
            //     ipcRenderer.send(IpcChannels.openSettingsWindow);
            // }

            // if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") {
            //     vueEventDispatcher.$emit(VueEventChannels.focusOnInput);
            // }

            // if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r") {
            //     ipcRenderer.send(IpcChannels.reloadApp);
            // }

            // if (event.key === "Escape") {
            //     ipcRenderer.send(IpcChannels.mainWindowHideRequested);
            // }

            // if (event.key === "F5") {
            //     ipcRenderer.send(IpcChannels.indexRefreshRequested);
            // }
        },
    },
});

document.onkeydown = (event: KeyboardEvent) => {
    app.mainWindowGlobalKeyPress(event);
};
