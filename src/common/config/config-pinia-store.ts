// // stores/counter.js
// import { defineStore } from 'pinia'

// export const useCounterStore = defineStore('counter', {
//   state: () => {
//     return { count: 0 }
//   },
//   // could also be defined as
//   // state: () => ({ count: 0 })
//   actions: {
//     increment() {
//       this.count++
//     },
//   },
// })







// config-store.ts
import { defineStore } from 'pinia';
import { UserConfigOptions } from './user-config-options';
import { mergeUserConfigWithDefault } from "../helpers/config-helpers";

interface ConfigState {
  userConfig: UserConfigOptions | null;
  defaultOptions: UserConfigOptions | null;
}

export const useConfigStore = defineStore({
  id: 'userConfig',
  state: (): ConfigState => ({
    userConfig: null as UserConfigOptions | null,
    defaultOptions: null as UserConfigOptions | null
  }),

  actions: {
    init(defaultOptions: UserConfigOptions) {
      this.defaultOptions = defaultOptions;
    },

    getConfig(defaultOptions: UserConfigOptions): UserConfigOptions {
      return mergeUserConfigWithDefault(this.userConfig, defaultOptions);
    },

    saveConfig(updatedConfig: UserConfigOptions): void {
      // method #1: change it directly, not using imutability
      // this.userConfig = updatedConfig;

      // method #2: Object.assign: It is more versatile as it can be used to merge multiple objects into one target object. It's also commonly used when you need to update properties conditionally.
      //  ***Note***: You're right to question the mutation of the userConfig directly, especially when working with state management libraries like Pinia. To follow a more conventional approach in state management, you should prefer immutability. Here's a modified version of the saveConfig method using Object.assign or the spread operator to create a new object and update the userConfig:       
      // this.userConfig = Object.assign({}, this.userConfig, updatedConfig);

      // method #3: Spread Operator: It is particularly convenient when you want to create a shallow copy of an object with a concise syntax. It is also commonly used in array operations.
      // Alternatively using the spread operator:
      this.userConfig = { ...this.userConfig, ...updatedConfig };
    },

    openConfigFile(): void {
      // Add your implementation for opening the config file
      throw new Error("Not implemented");
    },
  },
});
