<template>
<div class="user-input">

    <input
        :disabled="userInputDisabled()"
        ref="userInput"
        id="user-input"
        class="user-input__input"
        type="text"
        :modelValue="userInput"
        @update:modelValue="userInput = $event"
        @keydown="keyPress"
    >
</div>
<!-- v-model="userInput" -->

</template>


<script setup lang="ts">

import { defineComponent, ref, computed, onMounted, onUnmounted, watch, onErrorCaptured } from "vue";
import { inject } from 'vue';
// import { vueEventDispatcher } from "./vue-event-dispatcher";
import { VueEventChannels } from "../renderer-common/vue-event-channels";
// import { showLoaderDelay } from "./renderer-helpers";
import { UserConfigOptions } from "../common/config/user-config-options";
import { AppearanceOptions } from "../common/config/appearance-options";
import { GeneralOptions } from "../common/config/general-options";

import { IpcChannels } from "../common/ipc-channels";

import { useIpcRenderer } from '@vueuse/electron'
// // enable nodeIntegration if you don't provide ipcRenderer explicitly
// // @see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
const ipcRenderer = useIpcRenderer()

// I could use `executionIsPending` directly in the template
const executionIsPending = ref(false);

// // const executionIsPending = ref(false);
const userInputDisabled = () => executionIsPending.value;

// this is the same as above, but with a computed property instead of a function and the difference is that the computed property is cached
// const userInputDisabled = computed(() => executionIsPending.value);


const props = defineProps(["config", "translations"])
let dispatcher = inject('emitter'); // Inject `emitter`


function keyPress(event: KeyboardEvent) {
  const ctrlOrMeta = event.ctrlKey || event.metaKey;

  ipcRenderer.send(IpcChannels.remoteLog, "🦄 (renderer-app) KeyboardEvent: " + event.key);

  if (event.key === "ArrowUp" || (ctrlOrMeta && event.key.toLowerCase() === "p")) {
      event.preventDefault();
      // if (event.shiftKey) {
      //     dispatcher.emit(VueEventChannels.selectInputHistoryItem, "previous");
      //     // vueEventDispatcher.$emit(VueEventChannels.selectInputHistoryItem, "previous");
      // } else {
      //     dispatcher.emit(VueEventChannels.selectPreviousItem);
      //     // vueEventDispatcher.$emit(VueEventChannels.selectPreviousItem);
      // }
  }

  if (event.key === "ArrowDown" || (ctrlOrMeta && event.key.toLowerCase() === "n")) {
      event.preventDefault();
      // if (event.shiftKey) {
      //     vueEventDispatcher.$emit(VueEventChannels.selectInputHistoryItem, "next");
      // } else {
      //     vueEventDispatcher.$emit(VueEventChannels.selectNextItem);
      // }
  }

  if (event.key === "PageUp") {
      event.preventDefault();
      // vueEventDispatcher.$emit(VueEventChannels.pageUpPress);
  }

  if (event.key === "PageDown") {
      event.preventDefault();
      // vueEventDispatcher.$emit(VueEventChannels.pageDownPress);
  }

  if (event.key.toLowerCase() === "f" && ctrlOrMeta) {
      event.preventDefault();
      // vueEventDispatcher.$emit(VueEventChannels.favoritesRequested);
  }

  if (event.key === "Enter") {
      ipcRenderer.send(IpcChannels.remoteLog, "🦄 (user-input-compnent.vue) will emit ");
      const privileged: boolean = event.shiftKey;
      const userConfirmed: boolean = this.userConfirmationDialogVisible;
      
      dispatcher.emit('myevent', 100);

      // dispatcher.emit(VueEventChannels.enterPress, this.userInput, privileged, userConfirmed);
      ipcRenderer.send(IpcChannels.remoteLog, "🦄 (user-input-compnent.vue) enterPress emitted.");
  }

  if (event.key === "Tab") {
      event.preventDefault();
      // vueEventDispatcher.$emit(VueEventChannels.tabPress);
  }

  if (event.key.toLowerCase() === "o" && ctrlOrMeta) {
      // vueEventDispatcher.$emit(VueEventChannels.openSearchResultLocationKeyPress);
  }
}

</script>


<style>

.user-input {
    position: relative;
    background-color: var(--user-input--background-color);
    width: 100%;
    height: var(--user-input--height);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 0 var(--user-input--side-padding);
    box-sizing: border-box;
    overflow: hidden;
    border-radius: var(--user-input--border-radius);
    margin-bottom: var(--user-input--bottom-margin);
    -webkit-app-region: drag;
}

.user-input__search-icon-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-right: calc(var(--user-input--side-padding) / 2);
}

.user-input__search-icon {
    fill: var(--user-input--color);
    width: var(--user-input--icon-size);
    height: var(--user-input--icon-size);
    transition: all 500ms ease-in-out;
}

.user-input__search-icon.spinning {
    animation: spinning;
    animation-duration: 1.5s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
}

.user-input__input {
    background: transparent;
    width: 100%;
    border: none;
    outline: none;
    box-sizing: border-box;
    font-size: var(--user-input--font-size);
    font-weight: var(--user-input--font-weight);
    font-family: var(--font-family);
    color: var(--user-input--color);
    -webkit-app-region: no-drag;
}

.user-input__input:focus {
    outline: none;
}

.user-input__user-confirmation-container {
    position: absolute;
    height: 100%;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 15px;
    color: var(--user-input--color);
    font-size: 14px;
    font-weight: 100;
    transform: translateX(100%);
    transition: all 250ms ease-in-out;
}

.user-input__user-confirmation-container.visible {
    transform: translateX(0);
}

.user-input__user-confirmation-icon {
    width: 24px;
    height: 24px;
    margin-right: 5px;
}

</style>
