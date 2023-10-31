import Vue from "vue";
import { vueEventDispatcher } from "../../vue-event-dispatcher";
import { VueEventChannels } from "../../vue-event-channels";
import { GeneralHttpRequest } from "../../../main/plugins/general-http-requester-plugin/general-http-request";
import {
    defaultNewGeneralHttpRequest,
    isValidGeneralHttpRequestToAdd,
} from "../../../main/plugins/general-http-requester-plugin/general-http-requester-helpers";
import { TranslationSet } from "../../../common/translation/translation-set";
import { NotificationType } from "../../../common/notification-type";
import { ModalEditMode } from "./modal-edit-mode";
import { deepCopy, isEqual } from "../../../common/helpers/object-helpers";

export const generalHttpRequesterEditingModal = Vue.extend({
    computed: {
        noChanges(): boolean {
            return isEqual(this.initalGeneralHttpRequest, this.generalHttpRequest);
        },
    },
    data() {
        return {
            autofocus: true,
            visible: false,
            generalHttpRequest: deepCopy(defaultNewGeneralHttpRequest),
        };
    },
    methods: {
        onBackgroundClick() {
            this.visible = false;
        },
        closeButtonClick() {
            this.visible = false;
        },
        saveButtonClick() {
            const generalHttpRequest: GeneralHttpRequest = this.generalHttpRequest;
            const translations: TranslationSet = this.translations;
            if (isValidGeneralHttpRequestToAdd(generalHttpRequest)) {
                this.visible = false;
                vueEventDispatcher.$emit(
                    VueEventChannels.generalHttpRequestEdited,
                    this.generalHttpRequest,
                    this.editMode,
                    this.saveIndex,
                );
            } else {
                vueEventDispatcher.$emit(
                    VueEventChannels.notification,
                    translations.websearchInvalidWebsearchEngine,
                    NotificationType.Error,
                );
            }
        },
        onUrlBlurGetFaviconUrl() {
            const generalHttpRequest: GeneralHttpRequest = this.generalHttpRequest;
            if (generalHttpRequest.url.length > 0) {
                try {
                    const url = new URL(generalHttpRequest.url);
                    generalHttpRequest.icon.parameter = `${url.protocol}//${url.hostname}/favicon.ico`;
                } catch {
                    generalHttpRequest.icon.parameter = "";
                }
            }
        },
        getModalTitle(): string {
            const editMode: ModalEditMode = this.editMode;
            const translations: TranslationSet = this.translations;
            switch (editMode) {
                case ModalEditMode.Add:
                    return translations.httpRequesterEditingModalTitleAdd;
                case ModalEditMode.Edit:
                    return translations.httpRequesterEditingModalTitleEdit;
            }
        },
        getNamePlaceholder(): string {
            const translations: TranslationSet = this.translations;
            return `${translations.forExample}: "Google"`;
        },
        getPrefixPlaceholder(): string {
            const translations: TranslationSet = this.translations;
            return `${translations.forExample}: "g?"`;
        },
        getUrlPlaceholder(): string {
            const translations: TranslationSet = this.translations;
            return `${translations.forExample}: "https://google.com/search?q={{query}}"`;
        },
    },
    mounted() {
        vueEventDispatcher.$on(
            VueEventChannels.openGeneralHttpRequesterEditingModal,
            (generalHttpRequest: GeneralHttpRequest, editMode: ModalEditMode, saveIndex?: number) => {
                this.visible = true;
                this.generalHttpRequest = generalHttpRequest;
                this.editMode = editMode;
                this.initalGeneralHttpRequest = deepCopy(generalHttpRequest);
                this.saveIndex = saveIndex;
                this.autofocus = true;
            },
        );
    },
    props: ["translations"],
    template: `
    <div class="modal" :class="{ 'is-active' : visible }">
        <div class="modal-background" @click="onBackgroundClick"></div>
        <div class="modal-content">
            <div class="message">
                <div class="message-header">
                    <p>{{ getModalTitle() }}</p>
                    <button class="delete" aria-label="delete" @click="closeButtonClick"></button>
                </div>
                <div class="message-body">

                    <div class="field">
                        <label class="label">
                            {{ translations.websearchName }}
                        </label>
                        <div class="control is-expanded">
                            <input class="input" type="text" v-model="generalHttpRequest.name" :autofocus="autofocus" :placeholder="getNamePlaceholder()">
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">
                            {{ translations.websearchPrefix }}
                        </label>
                        <div class="control is-expanded">
                            <input class="input font-mono" type="text" v-model="generalHttpRequest.prefix" :placeholder="getPrefixPlaceholder()">
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">
                            {{ translations.websearchUrl }}
                        </label>
                        <div class="control is-expanded">
                            <input class="input" type="url" v-model="generalHttpRequest.url" :placeholder="getUrlPlaceholder()" @blur="onUrlBlurGetFaviconUrl()">
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">
                            {{ translations.httpRequesterMethod }}
                        </label>
                        <div class="control is-expanded">
                            <div class="select is-fullwidth">
                                <select v-model="generalHttpRequest.httpMethod">
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="PATCH">PATCH</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">
                            {{ translations.httpRequesterCopyToClipboard }}
                        </label>
                        <div class="control is-expanded">
                            <input class="is-checkradio" id="isCopyToClipboardCheckbox" type="checkbox" name="isCopyToClipboardCheckbox" v-model="generalHttpRequest.isCopyToClipboard">
                            <label for="isCopyToClipboardCheckbox"></label>
                            <div class="field">
                                <input class="is-checkradio is-block is-success" id="isCopyToClipboardCheckbox" type="checkbox" name="isCopyToClipboardCheckbox" checked="checked">
                            </div>
                        </div>
                    </div>

                    <div class="field" style="margin-right: 10px">
                        <label class="label">
                            {{ translations.websearchSuggestionUrl }}
                        </label>
                        <div class="control is-expanded">
                            <input class="input" type="url" v-model="generalHttpRequest.suggestionUrl" placeholder="Suggestion URL">
                        </div>
                    </div>                    

                    <div class="field">
                        <label class="label">
                            {{ translations.websearchSuggestionUrl }}
                        </label>
                        <div class="control is-expanded">
                            <input class="input" type="url" v-model="generalHttpRequest.suggestionUrl" placeholder="Suggestion URL">
                        </div>
                    </div>

                    <icon-editing :icon="generalHttpRequest.icon" :translations="translations"></icon-editing>

                    <div class="field">
                        <label class="label">
                            {{ translations.websearchPriority }}
                        </label>
                        <div class="control is-expanded">
                            <input class="input" type="number" min="0" v-model="generalHttpRequest.priority">
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">
                            {{ translations.websearchIsFallback }}
                        </label>
                        <div class="control is-expanded">
                            <input class="is-checkradio" id="isFallbackCheckbox" type="checkbox" name="isFallbackCheckbox" v-model="generalHttpRequest.isFallback">
                            <label for="isFallbackCheckbox"></label>
                            <div class="field">
                                <input class="is-checkradio is-block is-success" id="isFallbackCheckbox" type="checkbox" name="isFallbackCheckbox" checked="checked">
                            </div>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">
                            {{ translations.websearchEncodeSearchTerm }}
                        </label>
                        <div class="control is-expanded">
                            <input class="is-checkradio" id="encodeSearchTermCheckbox" type="checkbox" name="encodeSearchTermCheckbox" v-model="generalHttpRequest.encodeSearchTerm">
                            <label for="encodeSearchTermCheckbox"></label>
                            <div class="field">
                                <input class="is-checkradio is-block is-success" id="encodeSearchTermCheckbox" type="checkbox" name="encodeSearchTermCheckbox" checked="checked">
                            </div>
                        </div>
                    </div>

                    <div class="field is-grouped is-grouped-right">
                        <div class="control">
                            <button class="button is-danger" @click="closeButtonClick">
                                <span class="icon">
                                    <i class="fas fa-times"></i>
                                </span>
                                <span>{{ translations.cancel }}</span>
                            </button>
                        </div>
                        <div class="control">
                            <button :disabled="noChanges" class="button is-success" @click="saveButtonClick">
                                <span class="icon">
                                    <i class="fas fa-check"></i>
                                </span>
                                <span>{{ translations.save }}</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    `,
});
