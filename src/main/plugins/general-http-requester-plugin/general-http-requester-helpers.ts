import { GeneralHttpRequest } from "./general-http-request";
import { IconType } from "../../../common/icon/icon-type";
import { isValidIcon } from "../../../common/icon/icon-helpers";

export const defaultNewGeneralHttpRequest: GeneralHttpRequest = {
    encodeSearchTerm: true,
    icon: {
        parameter: "",
        type: IconType.URL,
    },
    isFallback: false,
    name: "",
    prefix: "",
    priority: 0,
    url: "",
    httpMethod: "GET",
    isCopyToClipboard: false
};

export function isValidGeneralHttpRequestToAdd(generalHttpRequest: GeneralHttpRequest): boolean {
    const iconCondition =
        generalHttpRequest.icon.parameter && generalHttpRequest.icon.parameter.length > 0
            ? isValidIcon(generalHttpRequest.icon)
            : true;

    return (
        generalHttpRequest !== undefined &&
        generalHttpRequest.name.length > 0 &&
        generalHttpRequest.url.length > 0 &&
        generalHttpRequest.url.indexOf("{{query}}") > -1 &&
        iconCondition
    );
}
