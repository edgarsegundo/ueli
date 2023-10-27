import { TranslationLanguage } from "../../main/plugins/translation-plugin/translation-language";

export interface GrammarCheckerOptions {
    enabled: boolean;
    debounceDelay: number;
    minSearchTermLength: number;
    prefix: string;
    sourceLanguage: TranslationLanguage;
    targetLanguage: TranslationLanguage;
}

export const defaultGrammarCheckerOptions: GrammarCheckerOptions = {
    debounceDelay: 250,
    enabled: false,
    minSearchTermLength: 3,
    prefix: "t?",
    sourceLanguage: TranslationLanguage.German,
    targetLanguage: TranslationLanguage.English,
};
