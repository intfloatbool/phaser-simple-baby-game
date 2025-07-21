import { IFBCancellablePromiseVoidAsync, IFBDelayAsync } from "../ifb-utilz/IFBAsyncs";
import { IFBStringIsNullUndefinedOrEmpty } from "../ifb-utilz/IFBUtils";
import { EventBus } from "./EventBus";
import type { SDK } from 'ysdk';

export enum LanguageType {
    RU = "ru",
    EN = "en"
}
class GameService {

    private _isMusicMuted: boolean = false;
    private _currentLanguage: LanguageType;
    private _isSdkInit: boolean

    constructor() {
        this._isSdkInit = false;
        this._currentLanguage = navigator.language.toLowerCase().includes("ru") ? LanguageType.RU : LanguageType.EN; 
    }

    async playSoundAsyncByManager(key: string, soundManager:  Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager, signal: AbortSignal, timeOffset: number = 0) {
        if(IFBStringIsNullUndefinedOrEmpty(key)) {
            return;
        }
        const sound = soundManager.add(key);
        const duration = sound.duration;
        sound.play();

        IFBCancellablePromiseVoidAsync(IFBDelayAsync(duration,signal)).then((_) => {
            sound.stop();
            sound.destroy();
        });

        await IFBCancellablePromiseVoidAsync(IFBDelayAsync(duration + timeOffset, signal));
        sound.stop();
        sound.destroy();
    }

    async playVoiceAsyncBymanager(key: string, soundManager:  Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager, signal: AbortSignal, timeOffset: number = 0) {
        if(IFBStringIsNullUndefinedOrEmpty(key)) {
            return;
        }
        const currentLanguage = this._currentLanguage;
        const sound = soundManager.add(key+`_`+currentLanguage);
        const duration = sound.duration;
        sound.play();
        IFBCancellablePromiseVoidAsync(IFBDelayAsync(duration,signal)).then((_) => {
            sound.stop();
            sound.destroy();
        });

        await IFBCancellablePromiseVoidAsync(IFBDelayAsync(duration + timeOffset, signal));
        sound.stop();
        sound.destroy();
    }

    public isMusicMuted(): boolean {
        return this._isMusicMuted;
    }

    public setIsMusicMuted(value: boolean) {
        this._isMusicMuted = value;
        EventBus.emit("music_mute_option", this._isMusicMuted);
    }

    public getCurrentLanguage(): LanguageType {
        return this._currentLanguage;
    }

    public setCurrentLanguage(lang: LanguageType) {
        this._currentLanguage = lang;
    }

    public async InitYandexSdk() {
        // debug
        return;
        if(this._isSdkInit) {
            return;
        }

        this._isSdkInit = true;
       
        await IFBDelayAsync(2, new AbortController().signal);
        const sdk: SDK = await YaGames.init();
        console.log("Yandex sdk inited!");
    }
}

export const GameServiceInstance = new GameService();