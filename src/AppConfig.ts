import { SceneNames } from "./game/AppGlobals"
import { Boot } from "./game/scenes/Boot"
import { GNLFirst } from "./game/scenes/minigames/guess_n_learn/GNLFirst"
import { GNLFourGuess } from "./game/scenes/minigames/guess_n_learn/GNLFourGuess"
import { GNLSecondLearn } from "./game/scenes/minigames/guess_n_learn/GNLSecondLearn"
import { GNLThirdSeek } from "./game/scenes/minigames/guess_n_learn/GNLThirdSeek"
import { Preloader } from "./game/scenes/Preloader"

type AppConfig = {
    loadingScreenAdditionalTime: number,
    firstSceneToLoadAfterPreloadKey: string,
    gameScenes: Phaser.Types.Scenes.SceneType | Phaser.Types.Scenes.SceneType[]
}

export const AppConfigInstance: AppConfig = {
    loadingScreenAdditionalTime: 0.1,
    firstSceneToLoadAfterPreloadKey: SceneNames.GAME_GUESS_N_LEARN_0,
    gameScenes: [
        Boot,
        Preloader,
        //> Games
        //  >> Gues_n_learn
        GNLFirst,
        GNLSecondLearn,
        GNLThirdSeek,
        GNLFourGuess,
    ]
}