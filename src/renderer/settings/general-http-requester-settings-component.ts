import Vue from "vue";
import { vueEventDispatcher } from "../vue-event-dispatcher";
import { VueEventChannels } from "../vue-event-channels";
import { PluginSettings } from "./plugin-settings";
import { UserConfigOptions } from "../../common/config/user-config-options";
import { defaultGeneralHttpRequesterOptions } from "../../common/config/general-http-requester-options";
import { defaultNewGeneralHttpRequest } from "../../main/plugins/general-http-requester-plugin/general-http-requester-helpers";
import { GeneralHttpRequest } from "../../main/plugins/general-http-requester-plugin/general-http-request";
import { ModalEditMode } from "./modals/modal-edit-mode";
import { defaultWebSearchIcon } from "../../common/icon/default-icons";
import { TranslationSet } from "../../common/translation/translation-set";
import { UserConfirmationDialogParams, UserConfirmationDialogType } from "./modals/user-confirmation-dialog-params";
import { deepCopy } from "../../common/helpers/object-helpers";

export const generalHttpRequesterSettingsComponent = Vue.extend({
    data() {
        return {
            defaultWebSearchIcon,
            settingName: PluginSettings.GeneralHttpRequester,
            visible: false,
        };
    },
    methods: {
        editGeneralHttpRequester(index: number) {
            const config: UserConfigOptions = this.config;
            const generalHttpRequest = config.generalHttpRequesterOptions.generalHttpRequests[index];
            vueEventDispatcher.$emit(
                VueEventChannels.openGeneralHttpRequesterEditingModal,
                deepCopy(generalHttpRequest),
                ModalEditMode.Edit,
                index,
            );
        },
        onAddGeneralHttpRequesterClick() {
            vueEventDispatcher.$emit(
                VueEventChannels.openGeneralHttpRequesterEditingModal,
                deepCopy(defaultNewGeneralHttpRequest),
                ModalEditMode.Add,
            );
        },
        resetAll() {
            const translations: TranslationSet = this.translations;
            const userConfirmationDialogParams: UserConfirmationDialogParams = {
                callback: () => {
                    const config: UserConfigOptions = this.config;
                    config.generalHttpRequesterOptions = deepCopy(defaultGeneralHttpRequesterOptions);
                    this.updateConfig();
                },
                message: translations.resetPluginSettingsToDefaultWarning,
                modalTitle: translations.resetToDefault,
                type: UserConfirmationDialogType.Default,
            };
            vueEventDispatcher.$emit(VueEventChannels.settingsConfirmation, userConfirmationDialogParams);
        },
        toggleEnabled() {
            const config: UserConfigOptions = this.config;
            config.generalHttpRequesterOptions.isEnabled = !config.generalHttpRequesterOptions.isEnabled;
            this.updateConfig();
        },
        updateConfig() {
            vueEventDispatcher.$emit(VueEventChannels.configUpdated, this.config);
        },
        addGeneralHttpRequest(generalHttpRequest: GeneralHttpRequest) {
            const config: UserConfigOptions = this.config;
            config.generalHttpRequesterOptions.generalHttpRequests.push(generalHttpRequest);
            this.updateConfig();
        },
        updateWebsearchEngine(generalHttpRequest: GeneralHttpRequest, index: number) {
            const config: UserConfigOptions = this.config;
            config.generalHttpRequesterOptions.generalHttpRequests[index] = deepCopy(generalHttpRequest);
            this.config = deepCopy(config);
            this.updateConfig();
        },
        removeWebsearchEngine(index: number) {
            const config: UserConfigOptions = this.config;
            config.generalHttpRequesterOptions.generalHttpRequests.splice(index, 1);
            this.updateConfig();
        },
    },
    mounted() {
        vueEventDispatcher.$on(VueEventChannels.showSetting, (settingName: PluginSettings) => {
            if (this.settingName === settingName) {
                this.visible = true;
            } else {
                this.visible = false;
            }
        });

        vueEventDispatcher.$on(
            VueEventChannels.generalHttpRequestEdited,
            (generalHttpRequest: GeneralHttpRequest, editMode: ModalEditMode, saveIndex?: number) => {
                if (editMode === ModalEditMode.Add) {
                    this.addGeneralHttpRequest(generalHttpRequest);
                } else if (editMode === ModalEditMode.Edit) {
                    this.updateWebsearchEngine(generalHttpRequest, saveIndex);
                }
            },
        );
    },
    props: ["config", "translations"],
    template: `
    <div v-if="visible">
        <div class="settings__setting-title title is-3">
            <span>
                {{ translations.websearch }}
            </span>
            <div>
                <plugin-toggle :is-enabled="config.generalHttpRequesterOptions.isEnabled" :toggled="toggleEnabled"/>
                <button v-if="config.generalHttpRequesterOptions.isEnabled" class="button" @click="resetAll">
                    <span class="icon"><i class="fas fa-undo-alt"></i></span>
                </button>
            </div>
        </div>
        <p class="settings__setting-description" v-html="translations.websearchSettingDescription"></p>
        <div class="settings__setting-content">
            <div v-if="!config.generalHttpRequesterOptions.isEnabled" class="settings__setting-disabled-overlay"></div>
            <div class="settings__setting-content-item box">
                <div class="settings__setting-content-item-title">
                    <div class="title is-5">
                        {{ translations.websearchEngines }}
                    </div>
                </div>
                <div class="table-container">
                    <table v-if="config.generalHttpRequesterOptions.generalHttpRequests.length > 0" class="table is-striped is-fullwidth">
                        <thead>
                            <tr>
                                <th class="has-text-centered">{{ translations.edit }}</th>
                                <th class="has-text-centered">{{ translations.remove }}</th>
                                <th>{{ translations.websearchName }}</th>
                                <th>{{ translations.websearchPrefix }}</th>
                                <th>{{ translations.websearchUrl }}</th>
                                <th>{{ translations.websearchSuggestionUrl }}</th>
                                <th class="has-text-centered">{{ translations.websearchIcon }}</th>
                                <th class="has-text-centered">{{ translations.websearchPriority }}</th>
                                <th class="has-text-centered">{{ translations.websearchIsFallback }}</th>
                                <th class="has-text-centered">{{ translations.websearchEncodeSearchTerm }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(generalHttpRequest, index) in config.generalHttpRequesterOptions.generalHttpRequests">
                                <td class="has-text-centered">
                                    <button class="button" @click="editGeneralHttpRequester(index)">
                                        <span class="icon">
                                            <i class="fas fa-edit"></i>
                                        </span>
                                    </button>
                                </td>
                                <td class="has-text-centered">
                                    <button class="button is-danger" @click="removeWebsearchEngine(index)">
                                        <span class="icon">
                                            <i class="fas fa-trash"></i>
                                        </span>
                                    </button>
                                </td>
                                <td>{{ generalHttpRequest.name }}</td>
                                <td class="font-mono">{{ generalHttpRequest.prefix }}</td>
                                <td>{{ generalHttpRequest.url }}</td>
                                <td>{{ generalHttpRequest.suggestionUrl }}</td>
                                <td class="has-text-centered"><icon :icon="generalHttpRequest.icon" :defaulticon="defaultWebSearchIcon"></icon></td>
                                <td class="has-text-centered">{{ generalHttpRequest.priority }}</td>
                                <td class="has-text-centered"><i v-if="generalHttpRequest.isFallback" class="fas fa-check"></i></td>
                                <td class="has-text-centered"><i v-if="generalHttpRequest.encodeSearchTerm" class="fas fa-check"></i></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <button class="button is-success" @click="onAddGeneralHttpRequesterClick">
                        <span class="icon"><i class="fas fa-plus"></i></span>
                        <span>
                            Add new general http requester
                        </span>
                    </button>
                </div>
            </div>

        </div>
        <general-http-requester-editing-modal :translations="translations"></general-http-requester-editing-modal>
    </div>
    `,
});
