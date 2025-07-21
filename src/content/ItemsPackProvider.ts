import { GNLItem, GNLItemsPack } from "../game/scenes/minigames/guess_n_learn/GNLGameData"
import { PreloadData } from "../GameConfig"

export type ItemsPackProvider = {
    ItemPack: GNLItemsPack,
    PreloadItemsImagesDataCollection: PreloadData[],
    PreloadObstaclesImagesDataCollection: PreloadData[],
    PreloadBackgroundsImagesDataCollection: PreloadData[],
    PreloadVoicesDataCollection: PreloadData[],
    PreloadSfxDataCollection: PreloadData[]
}

export const IFBCreatePreloadData = (key: string, relativePath: string): PreloadData => {
    return {
        key: key,
        pathRelativeToAssets: relativePath,
    }
}

export const IFBCreateGNLItem =  (locKey: string, imageKey: string, voicePresentKey: string, sfxSoundKey: string, globalNameKey: string): GNLItem => {
    return {
        uid: crypto.randomUUID(),
        locKey: locKey,
        imageKey: imageKey,
        sfxPresentKey: voicePresentKey,
        sfxSoundKey:sfxSoundKey,
        globalNameKey: globalNameKey,
    }
}

export function IFBGetMultilangVoiceImageData(key: string, fileNameWithoutExtension: string): PreloadData[] {
    return [
        {
            key: `${key}_ru`,
            pathRelativeToAssets: `audio/voice/ru/${fileNameWithoutExtension}_ru.mp3`,
        },
        {
            key: `${key}_en`,
            pathRelativeToAssets: `audio/voice/en/${fileNameWithoutExtension}_en.mp3`,
        }
    ]
}
