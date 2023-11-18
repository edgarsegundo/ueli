import { GeneralOptions, defaultGeneralOptions } from "./general-options";
import { AppearanceOptions, defaultAppearanceOptions } from "./appearance-options";
import { ShortcutOptions, defaultShortcutOptions } from "./shortcuts-options";
import { ColorThemeOptions, defaultColorThemeOptions } from "./color-theme-options";
import {
    OperatingSystemSettingsOptions,
    defaultOperatingSystemSettingsOptions,
} from "./operating-system-settings-options";
import { ColorConverterOptions, defaultColorConverterOptions } from "./color-converter-options";
import { ControlPanelOptions, defaultControlPanelOptions } from "./control-panel-options";

export interface UserConfigOptions {
    appearanceOptions: AppearanceOptions;
    colorThemeOptions: ColorThemeOptions;
    shortcutOptions: ShortcutOptions;
    generalOptions: GeneralOptions;
    operatingSystemSettingsOptions: OperatingSystemSettingsOptions;
    colorConverterOptions: ColorConverterOptions;
    controlPanelOptions: ControlPanelOptions;
}

export const defaultUserConfigOptions: UserConfigOptions = {
    appearanceOptions: defaultAppearanceOptions,
    colorConverterOptions: defaultColorConverterOptions,
    colorThemeOptions: defaultColorThemeOptions,
    controlPanelOptions: defaultControlPanelOptions,
    generalOptions: defaultGeneralOptions,
    operatingSystemSettingsOptions: defaultOperatingSystemSettingsOptions,
    shortcutOptions: defaultShortcutOptions,
};