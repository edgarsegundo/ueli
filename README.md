# ueli tauri vue3

## Genesis

1. I followed this [tutorial](https://tauri.app/v1/guides/getting-started/prerequisites#setting-up-macos) to create this project.

***Note***: Replace command `npm` for `pnpm` if you are using `pnpm`

As the project structure is already set up, you can bypass Step 1 and proceed directly to Step 2 by running `pnpm install` if you've just cloned this project and branch for the first time.

2. To build the project, look at the file `package.json`

```zsh
pnpm run build                   : I use this when I want to build all parts
pnpm run build:renderer-app      : I use this when I want to build only renderer-app
pnpm run start                   : I use this to start the application
pnpm run dev                     : I use this to initiate hot reload for the main Electron part, but haven't achieved success in extending it to the renderers so far.
```

3. What progress has been made thus far

- I was able to replace the old vue 2 event handler and replace it by using mitt
- I manually copied the `img` folder to `/Users/edrezende/Personal/ueli-vue3/dist/` to ensure the `ueli.ai` icon displays correctly. To automate this process during building, consider configuring the `vite.config.ts` file. You may need to specify a relevant asset path or use the `vite-plugin-copy` plugin to copy the `img` folder during the build process. Adjust the configuration to ensure the proper inclusion of assets in the distribution folder.
- To test if typescript is working, run `npx ts-node hello.ts`

4. Where did I last leave off?

I'm trying to replace the electron-store for pinia but didn't succeed yet. There is this alternative to called Vuex (global state management), but I did not try. The last thing I did was to try to create and use the pinia in the `renderer.ts` file because I was not able to get it to work on the `user-input-component.ue` file where I want to use it. I have commented all the code because it was given me the following error:

Uncaught TypeError: Failed to resolve module specifier "pinia". Relative references must start with either "/", "./", or "../".

To reproduce the probelm just uncomment `app.use(createPinia())` on the `renderer.ts` file, run pnpm run build:renderer-app and pnpm run start 

I attempted to replace `electron-store` with `pinia` but encountered challenges. While considering the alternative, Vuex (for global state management), I have yet to explore it. In my recent efforts, I aimed to implement and use Pinia in the `renderer.ts` file, as incorporating it directly into the `user-input-component.ue` file proved challenging. The code, when uncommented, resulted in the following error:

```javascript
Uncaught TypeError: Failed to resolve module specifier "pinia". Relative references must start with either "/", "./", or "../".
```

To replicate the issue, uncomment `app.use(createPinia())` in the `renderer.ts` file, then execute `pnpm run build:renderer-app` followed by `pnpm run start`.

## Backlog

- Implement debug on main process
- logs don't work when using `pnpm run dev`
- Implement hot-load on renderer processes

## Debugging the Renderer Process

Create a launch.json file and include the following configuration:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "attach",
            "name": "Electron Renderer",
            "port": 9223,
            "webRoot": "${workspaceFolder}",
            "timeout": 20000
        }
    ]
}
```

![Refer to the image for a reminder on how to initiate debugging.](debugging-on-renderer-process.png)

## Lessons Learned

### Found 2 ways of creating and using `userInputDisabled`

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

## Errors

### If this error occurrs: dyld[13517]: Library not loaded: @rpath/Electron Framework.framework/Electron Framework

```bash
# Complete example
dyld[13517]: Library not loaded: @rpath/Electron Framework.framework/Electron Framework
  Referenced from: <4C4C44BB-5555-3144-A150-4885FF5CD369> /Users/edrezende/Personal/ueli-vue3/node_modules/.pnpm/electron@26.5.0/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron
  Reason: tried: '/Users/edrezende/Personal/ueli-vue3/node_modules/.pnpm/electron@26.5.0/node_modules/electron/dist/Electron.app/Contents/Frameworks/Electron Framework.framework/Electron Fra
```

***Solution***: You can get the location of the store via pnpm store path and then just delete it using rm -rf <path>

## Unstructured Notes

Event Bus (local communication):
Event Bus example was already demonstrated above. It is suitable when only a few components need to communicate and the data exchange is not complex.

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

- https://blog.logrocket.com/using-event-bus-vue-js-pass-data-between-components/