import { Icon } from "../../../common/icon/icon";

export interface GeneralHttpRequest {
    prefix: string;
    url: string;
    name: string;
    httpMethod: string;
    isCopyToClipboard: boolean;
    icon: Icon;
    priority: number;
    isFallback: boolean;
    encodeSearchTerm: boolean;
    suggestionUrl?: string;
}


