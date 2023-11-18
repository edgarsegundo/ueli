<template>
<p>Edgar Rezende II</p>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { vueEventDispatcher } from "./vue-event-dispatcher";
import { VueEventChannels } from "./vue-event-channels";
import { showLoaderDelay } from "./renderer-helpers";
import { UserConfigOptions } from "../common/config/user-config-options";
import { AppearanceOptions } from "../common/config/appearance-options";
import { GeneralOptions } from "../common/config/general-options";


export default {
  props: ["config", "translations"],
  setup(props) {
    const executionIsPending = ref(false);
    const loadingCompleted = ref(true);
    const loadingVisible = ref(false);
    const refreshIndexesIsPending = ref(false);
    const userConfirmationDialogVisible = ref(false);
    const userInput = ref("");

    const dispatcher = inject('emitter'); // Inject `emitter`

    const userInputDisabled = computed(() => executionIsPending.value);

    const keyPress = (event) => {
        const ctrlOrMeta = event.ctrlKey || event.metaKey;

        if (event.key === "ArrowUp" || (ctrlOrMeta && event.key.toLowerCase() === "p")) {
            event.preventDefault();
            if (event.shiftKey) {
                dispatcher.emit(VueEventChannels.selectInputHistoryItem, "previous");
            } else {
                dispatcher.emit(VueEventChannels.selectPreviousItem);
            }
        }

        if (event.key === "ArrowDown" || (ctrlOrMeta && event.key.toLowerCase() === "n")) {
            event.preventDefault();
            if (event.shiftKey) {
                dispatcher.emit(VueEventChannels.selectInputHistoryItem, "next");
            } else {
                dispatcher.emit(VueEventChannels.selectNextItem);
            }
        }

        if (event.key === "PageUp") {
            event.preventDefault();
            dispatcher.emit(VueEventChannels.pageUpPress);
        }

        if (event.key === "PageDown") {
            event.preventDefault();
            dispatcher.emit(VueEventChannels.pageDownPress);
        }

        if (event.key.toLowerCase() === "f" && ctrlOrMeta) {
            event.preventDefault();
            dispatcher.emit(VueEventChannels.favoritesRequested);
        }

        if (event.key === "Enter") {
            const privileged: boolean = event.shiftKey;
            const userConfirmed: boolean = userConfirmationDialogVisible.value;
            dispatcher.emit(VueEventChannels.enterPress, userInput.value, privileged, userConfirmed);
        }

        if (event.key === "Tab") {
            event.preventDefault();
            dispatcher.emit(VueEventChannels.tabPress);
        }

        if (event.key.toLowerCase() === "o" && ctrlOrMeta) {
            dispatcher.emit(VueEventChannels.openSearchResultLocationKeyPress);
        }

    };

    const resetUserInput = () => {
      userInput.value = "";
    };

    const setFocusOnInput = () => {
      const $userInput = document.getElementById('user-input');
      $userInput.focus();
    };

    const selectUserInput = () => {
      setFocusOnInput();
      document.execCommand("selectall");
    };

    const updateUserInput = (updatedUserInput, selectText = false) => {
      userInput.value = updatedUserInput;

      // delay user input selection because user input update takes a while
      if (selectText) {
        setTimeout(selectUserInput, 50);
      }
    };

    onMounted(() => {
        setFocusOnInput();

        dispatcher.on(VueEventChannels.mainWindowHasBeenHidden, () => {
            // const config: UserConfigOptions = this.config;
            // if (!config.generalOptions.persistentUserInput) {
            //     resetUserInput();
            // } else {
            //     selectUserInput();
            // }
        });

        dispatcher.on(VueEventChannels.mainWindowHasBeenShown, () => {
            setFocusOnInput();
        });

        dispatcher.on(VueEventChannels.focusOnInput, () => {
            setFocusOnInput();
        });

        dispatcher.on(VueEventChannels.userConfirmationRequested, () => {
            userConfirmationDialogVisible.value = true;
        });

        dispatcher.on(VueEventChannels.userInputChange, () => {
            loadingCompleted.value = false;

            // show loader only when loading has not completed within the given time
            setTimeout(() => {
                if (!loadingCompleted.value) {
                    loadingVisible.value = true;
                }
            }, showLoaderDelay);
        });

        dispatcher.on(VueEventChannels.userInputUpdated, (updatedUserInput: string, selectText?: boolean) => {
            updateUserInput(updatedUserInput, selectText);
        });

        dispatcher.on(VueEventChannels.searchResultsUpdated, () => {
            loadingCompleted.value = true;
            loadingVisible.value = false;
        });

        dispatcher.on(VueEventChannels.handleExecution, () => {
            executionIsPending.value = true;
            loadingCompleted.value = false;
            loadingVisible.value = true;
        });

        dispatcher.on(VueEventChannels.executionFinished, () => {
            executionIsPending.value = false;
            loadingCompleted.value = true;
            loadingVisible.value = false;
            setTimeout(() => setFocusOnInput(), 50);
        });

        dispatcher.on(
            VueEventChannels.appearanceOptionsUpdated,
            (updatedAppearanceOptions: AppearanceOptions) => {
                // const config: UserConfigOptions = this.config;
                // config.appearanceOptions = updatedAppearanceOptions;
            },
        );

        dispatcher.on(VueEventChannels.generalOptionsUpdated, (updatedGeneralOptions: GeneralOptions) => {
            // const config: UserConfigOptions = this.config;
            // config.generalOptions = updatedGeneralOptions;
        });

        dispatcher.on(VueEventChannels.autoCompletionResponse, (updatedUserInput: string) => {
            userInput.value = updatedUserInput;
        });

        dispatcher.on(VueEventChannels.refreshIndexesStarted, () => {
            refreshIndexesIsPending.value = true;
        });

        dispatcher.on(VueEventChannels.refreshIndexesFinished, () => {
            refreshIndexesIsPending.value = false;
            setTimeout(setFocusOnInput, 50);
        });

    });

    // Inside the setup function
    watch(() => props.userInput, (val) => {
        userConfirmationDialogVisible.value = false;
        dispatcher.emit(VueEventChannels.userInputChange, val);
    });

    return {
      executionIsPending,
      loadingCompleted,
      loadingVisible,
      refreshIndexesIsPending,
      userConfirmationDialogVisible,
      userInput,
      userInputDisabled,
      keyPress,
      resetUserInput,
      setFocusOnInput,
      selectUserInput,
      updateUserInput
    };
  },
};
</script>


<style scoped>
</style>

