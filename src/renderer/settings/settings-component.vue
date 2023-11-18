<template>
  <p>settings-component 1976</p>
</template>

<script lang="ts">
// import { vueEventDispatcher } from "../vue-event-dispatcher";
import { VueEventChannels } from "../vue-event-channels";
import { NotificationType } from "../../common/notification-type";
import { PluginSettings } from "./plugin-settings";
import { SettingOsSpecific } from "./settings-os-specific";
// import { platform } from "os";
import { GeneralSettings } from "./general-settings";
import { defineComponent } from "vue";

import { deepCopy, hw } from "../../common/helpers/object-helpers";


// // enable nodeIntegration if you don't provide ipcRenderer explicitly
// // @see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
import { useIpcRenderer } from '@vueuse/electron'
import { IpcChannels } from "../../common/ipc-channels";
const ipcRenderer = useIpcRenderer()


ipcRenderer.send(IpcChannels.remoteLog, "🦄 (A1): ");


let ar = {"name":"test"}
// function deepCopy<T>(value: T): T {
//     return JSON.parse(JSON.stringify(value));
// }


let test = {}
// Wrap your setup logic in a try-catch block
try {
  // Your existing setup code here
  let test = deepCopy(ar)

  // Additional setup code...
} catch (error) {
  // Log or handle the error here
  // ipcRenderer.send(IpcChannels.remoteLog, `🦄 Error: ${error}`)
  console.error("An error occurred in setup:", error);
  ipcRenderer.send(IpcChannels.remoteLog, `🦄 (A2): ${test}`);
}

ipcRenderer.send(IpcChannels.remoteLog, `🦄 (A3): ${test}`);

export default defineComponent({
  computed: {
    notificationClass() {
      let typeClass = "is-info";

      const type = this.notification.type as NotificationType;
      switch (type) {
        case NotificationType.Error:
          typeClass = "is-danger";
          break;
        case NotificationType.Warning:
          typeClass = "is-warning";
          break;
      }

      return this.notification.visible ? `visible ${typeClass}` : typeClass;
    },
  },
  data() {
    return {
      generalSettingMenuItems: Object.values(GeneralSettings).sort(),
      notification: {
        message: "",
        type: undefined,
        visible: false,
      },
      // pluginSettingMenuItems: Object.values(PluginSettings)
      //   .map((setting) => setting.toString())
      //   .concat(
      //     Object.values(SettingOsSpecific)
      //       .map((setting) => setting.toString())
      //       .filter((setting: string) => setting.startsWith(platform()))
      //       .map((setting: string) => setting.replace(`${platform()}:`, "")),
      //   )
      //   .sort(),
    };
  },
  methods: {
    removeNotification() {
      this.notification.visible = false;
    },
    showNotification(message: string, type: NotificationType) {
      // if (autoHideErrorMessageTimeout) {
      //   clearTimeout(autoHideErrorMessageTimeout);
      // }

      this.notification = {
        message,
        type,
        visible: true,
      };

      // autoHideErrorMessageTimeout = Number(
      //   setTimeout(() => {
      //     this.removeNotification();
      //   }, autoHideErrorMessageDelayInMilliseconds),
      // );
    },
  },
  props: ["config", "translations"],
  mounted() {
    // vueEventDispatcher.$emit(VueEventChannels.showSetting, GeneralSettings.General);

    // vueEventDispatcher.$on(VueEventChannels.notification, (message: string, type: NotificationType) => {
    //   this.showNotification(message, type);
    // });
  },
});

</script>

<style scoped>
</style>