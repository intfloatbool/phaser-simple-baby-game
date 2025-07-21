import i18n from "./i18n";

class LocProvider {
    GetText(key: string) {
        return i18n.t(key) ?? key;
    }
}

export const LocProviderInstance: LocProvider = new LocProvider();