# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## 

npx ts-node hello.ts

https://vueuse.org/electron/useIpcRenderer/
https://vuejs.org/guide/introduction.html
https://www.jsgarden.co/blog/electron-with-typescript-and-vite-as-a-build-system


## Backlog

- evenbus on vue3
Event Bus (local communication):
Event Bus example was already demonstrated above. It is suitable when only a few components need to communicate and the data exchange is not complex.

Vuex (global state management):
Vuex allows centralized state management, which means data can be shared and accessed by multiple components across the entire application.

   *** Vue 3 Event Bus with Composition API
   https://stackoverflow.com/questions/66537320/vue-3-event-bus-with-composition-api
   https://github.com/developit/mitt
   https://shouts.dev/articles/data-pass-between-components-using-eventbus-in-vue3
   https://blog.logrocket.com/using-event-bus-vue-js-pass-data-between-components/


   https://blog.logrocket.com/using-event-bus-vue-js-pass-data-between-components/
   https://shouts.dev/articles/data-pass-between-components-using-eventbus-in-vue3

   provide/inject
   https://www.youtube.com/watch?v=hrWTUhBYpzc
   https://www.youtube.com/watch?v=lFYzA3kCM90
   
   

#29 - Vuex 4 State Management - Vue 3 (Options API) Tutorial
   https://www.youtube.com/watch?v=BcOmmM7jE1Y
   https://www.youtube.com/watch?v=cQCmmg3JvOs


In vue js we have essentially three ways of making unrelated components communicate with each other: Vuex, Pinia, Event Bus
https://medium.com/@certosinolab/using-event-bus-in-vue-js-3-425aae8c21a6


Vue 3 was a mistake that we should not repeat
https://medium.com/js-dojo/vue-3-was-a-mistake-that-we-should-not-repeat-81cc65484954


- Implementar debug on main and renderer procs
- logs don't work when using `pnpm run dev`
- hotload on renderers
- https://blog.logrocket.com/using-event-bus-vue-js-pass-data-between-components/

## vue 3 learning

```ts
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
```