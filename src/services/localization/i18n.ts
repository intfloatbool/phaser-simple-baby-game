// i18n.ts
import i18next from 'i18next';
import en from "../../../static/locales/en.json";
import ru from "../../../static/locales/ru.json";

i18next.init({
  lng: "ru", // TODO: detect language
  fallbackLng: "en",
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
});

export default i18next;
