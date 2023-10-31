import { SearchResultItem } from "../../../common/search-result-item";
import { PluginType } from "../../plugin-type";
import { UserConfigOptions } from "../../../common/config/user-config-options";
import { GeneralHttpRequesterOptions } from "../../../common/config/general-http-requester-options";
import { ExecutionPlugin } from "../../execution-plugin";
import { GeneralHttpRequest } from "./general-http-request";
import { TranslationSet } from "../../../common/translation/translation-set";
import { defaultWebSearchIcon } from "../../../common/icon/default-icons";
import { isValidIcon } from "../../../common/icon/icon-helpers";
import { AutoCompletionPlugin } from "../../auto-completion-plugin";

export class GeneralHttpRequesterPlugin implements ExecutionPlugin, AutoCompletionPlugin {
    public readonly pluginType = PluginType.GeneralHttpRequester;
    private config: GeneralHttpRequesterOptions;
    private translationSet: TranslationSet;
    private readonly urlExecutor: (url: string) => Promise<void>;
    private readonly suggestionResolver: (url: string) => Promise<string[][]>;

    constructor(
        userConfig: GeneralHttpRequesterOptions,
        translationSet: TranslationSet,
        urlExecutor: (url: string) => Promise<void>,
        suggestionResolver: (url: string) => Promise<string[][]>,
    ) {
        this.config = userConfig;
        this.translationSet = translationSet;
        this.urlExecutor = urlExecutor;
        this.suggestionResolver = suggestionResolver;
    }

    public getSearchResults(userInput: string, fallback?: boolean): Promise<SearchResultItem[]> {
        return new Promise((resolve, reject) => {
            const generalHttpRequests = this.config.generalHttpRequests
                .filter((generalHttpRequest) => {
                    return fallback ? generalHttpRequest.isFallback : userInput.startsWith(generalHttpRequest.prefix);
                })
                .sort((a, b) => {
                    if (a.priority > b.priority) {
                        return 1;
                    }
                    if (a.priority < b.priority) {
                        return -1;
                    }
                    return 0;
                });

            const suggestionWebSearchEngines = generalHttpRequests.filter((generalHttpRequest) => {
                return generalHttpRequest.suggestionUrl !== undefined;
            });

            this.getSuggestions(suggestionWebSearchEngines, userInput)
                .then((suggestions) => {
                    const results: SearchResultItem[] = [];

                    for (const generalHttpRequest of generalHttpRequests) {
                        results.push({
                            description: this.buildDescriptionFromUserInput(generalHttpRequest, userInput),
                            executionArgument: this.buildExecutionArgumentFromUserInput(generalHttpRequest, userInput),
                            hideMainWindowAfterExecution: true,
                            icon: isValidIcon(generalHttpRequest.icon) ? generalHttpRequest.icon : defaultWebSearchIcon,
                            name: generalHttpRequest.name,
                            originPluginType: this.pluginType,
                            searchable: [],
                        });
                    }

                    suggestions.forEach((suggestion) => results.push(suggestion));

                    resolve(results);
                })
                .catch((error) => reject(error));
        });
    }

    public isValidUserInput(userInput: string, fallback?: boolean): boolean {
        return userInput !== undefined && userInput.length > 0 && this.userInputMatches(userInput, fallback);
    }

    public execute(searchResultItem: SearchResultItem): Promise<void> {
        return this.urlExecutor(searchResultItem.executionArgument);
    }

    public autoComplete(searchResultItem: SearchResultItem): string {
        const searchUrl = searchResultItem.executionArgument.match(/^([^:]+:\/\/[^/]+)\//)
            ? RegExp.$1
            : searchResultItem.executionArgument;

        const foundWebSearchEngine = this.config.generalHttpRequests.find((websearchEngine) => {
            return websearchEngine.url.includes(searchUrl);
        });

        const prefix = foundWebSearchEngine ? foundWebSearchEngine.prefix : "";

        return `${prefix}${searchResultItem.name} `;
    }

    public isEnabled() {
        return this.config.isEnabled;
    }

    public updateConfig(updatedConfig: UserConfigOptions, translationSet: TranslationSet): Promise<void> {
        return new Promise((resolve) => {
            this.config = updatedConfig.generalHttpRequesterOptions;
            this.translationSet = translationSet;
            resolve();
        });
    }

    private buildDescriptionFromUserInput(generalHttpRequest: GeneralHttpRequest, userInput: string): string {
        return this.buildDescriptionFromSearchTerm(
            generalHttpRequest,
            this.getSearchTerm(generalHttpRequest, userInput, true),
        );
    }

    private buildDescriptionFromSearchTerm(generalHttpRequest: GeneralHttpRequest, searchTerm: string): string {
        return this.translationSet.websearchDescription
            .replace("{{websearch_engine}}", generalHttpRequest.name)
            .replace("{{search_term}}", searchTerm);
    }

    private getSearchTerm(generalHttpRequest: GeneralHttpRequest, userInput: string, skipEncoding = false): string {
        let searchTerm = userInput.replace(generalHttpRequest.prefix, "");

        if (generalHttpRequest.encodeSearchTerm && !skipEncoding) {
            searchTerm = encodeURIComponent(searchTerm);
        }

        return searchTerm;
    }

    private buildExecutionArgumentFromUserInput(generalHttpRequest: GeneralHttpRequest, userInput: string): string {
        return this.buildExecutionArgumentFromSearchTerm(
            generalHttpRequest,
            this.getSearchTerm(generalHttpRequest, userInput),
        );
    }

    private buildExecutionArgumentFromSearchTerm(generalHttpRequest: GeneralHttpRequest, searchTerm: string): string {
        return this.replaceQueryInUrl(searchTerm, generalHttpRequest.url);
    }

    private userInputMatches(userInput: string, fallback?: boolean): boolean {
        return this.config.generalHttpRequests.some((websearchEngine) => {
            return fallback ? websearchEngine.isFallback : userInput.startsWith(websearchEngine.prefix);
        });
    }

    private getSuggestions(generalHttpRequests: GeneralHttpRequest[], userInput: string): Promise<SearchResultItem[]> {
        return new Promise((resolve, reject) => {
            const promises = generalHttpRequests.map((generalHttpRequest) =>
                this.getSuggestionsByWebSearchEngine(generalHttpRequest, userInput),
            );

            Promise.all(promises)
                .then((lists) => {
                    const result: SearchResultItem[] = [];

                    lists.forEach((list) => {
                        list.forEach((item) => result.push(item));
                    });

                    resolve(result);
                })
                .catch((error) => reject(error));
        });
    }

    private getSuggestionsByWebSearchEngine(
        websearchEngine: GeneralHttpRequest,
        userInput: string,
    ): Promise<SearchResultItem[]> {
        const searchTerm = this.getSearchTerm(websearchEngine, userInput);

        return new Promise((resolve, reject) => {
            if (websearchEngine.suggestionUrl && searchTerm) {
                const suggestionUrl = this.replaceQueryInUrl(searchTerm, websearchEngine.suggestionUrl);

                this.suggestionResolver(suggestionUrl)
                    .then((response) => {
                        const suggestions: string[] = response[1];

                        const searchResultItems = suggestions.map((suggestion): SearchResultItem => {
                            return {
                                description: this.buildDescriptionFromSearchTerm(websearchEngine, suggestion),
                                executionArgument: this.buildExecutionArgumentFromSearchTerm(
                                    websearchEngine,
                                    suggestion,
                                ),
                                hideMainWindowAfterExecution: true,
                                icon: isValidIcon(websearchEngine.icon) ? websearchEngine.icon : defaultWebSearchIcon,
                                name: suggestion,
                                originPluginType: this.pluginType,
                                searchable: [],
                                supportsAutocompletion: true,
                            };
                        });

                        resolve(searchResultItems);
                    })
                    .catch((error) => reject(error));
            } else {
                resolve([]);
            }
        });
    }

    private replaceQueryInUrl(query: string, url: string): string {
        return url.replace(/{{query}}/g, query);
    }
}
