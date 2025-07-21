import { GameObjects, Scene } from "phaser";
import { CreateDefaultResizableGO, IResizable, ResizableDataMementoResizable, ResizeData } from "../../../../ifb-utilz/ResponseInterfaces";
import { GameEvents, GetCurrentScreenFactor, GetCurrentScreenFactorFromScene, IFB_LOG, IFB_LOG_ERR, IFB_THROW_ERR, PerfectScreenSize, SceneNames, ScreenCenter, ScreenCenterCopy } from "../../../AppGlobals";
import { EventBus } from "../../../EventBus";
import { GNLGameDataProviderInstance } from "./GNLGameDataProvider";
import { GNLItem, GNLItemsPack } from "./GNLGameData";
import { GameConfigInstance, SpeedMultiplier } from "../../../../GameConfig";
import { LocProviderInstance } from "../../../../services/localization/LocProvider";
import { IFBVector2, IFBVector2One, IFBVector2Zero } from "../../../../ifb-utilz/IFBMath";
import { IFBCancellablePromiseVoidAsync, IFBDelayAsync, IFBIsCancelledException } from "../../../../ifb-utilz/IFBAsyncs";
import { IFBGetRandomElementFromArray, IFBShuffleArray } from "../../../../ifb-utilz/IFBUtils";
import { GameServiceInstance } from "../../../GameService";
import { IFBPlayCongratsVfx, IFBRunPhaserTweenAsync, IFBRunShakePhaserTweenAsync, IFBTapTutorialLoopAsync } from "../../../GameUtils";

type SpawnedItemRef = {
    index: number,
    itemData: GNLItem,
    container: GameObjects.Container,
    resizable: IResizable
    isClickable: boolean,
    image: GameObjects.Image,
    isGuessed: boolean,
}

export class GNLFourGuess extends Scene implements IResizable {
    private _resizableMemento: ResizableDataMementoResizable;
    private _resizables: IResizable[];
    private _isReady: boolean = false;
    private _abortController: AbortController;
    private _isDone: boolean = false;
    private _transformsArr: Phaser.GameObjects.Components.Transform[];
    private _currentItemsPack: GNLItemsPack;

    private _elemsBaseAngles: number[];
    private _elemsBasePositions: IFBVector2[];
    private _spawnedItems: SpawnedItemRef[];
    private _itemsAbortControllers: AbortController[];
    private _onGuessItemClickedAction: (gnlItem: GNLItem) => void;
    private _isGuessItemFound: boolean;
    private _lastGuessItem: GNLItem;
    private _allItems: GNLItem[];
    private _isShowGuessedProcess: boolean;

    constructor() {
        super(SceneNames.GAME_GUESS_N_LEARN_3);
        this._resizableMemento = new ResizableDataMementoResizable();
        this._resizables = [
            this._resizableMemento
        ];
    }
    preload() {

        if(!GNLGameDataProviderInstance.GameData.isReady) {
            IFB_THROW_ERR("!GNLGameDataProviderInstance.GameData.isReady");
        }

        if(GNLGameDataProviderInstance.GameData.itemsPack.items.length <= 0) {
            IFB_THROW_ERR("GNLGameDataProviderInstance.GameData.itemsPack.items.length <= 0");
        }

        if(GNLGameDataProviderInstance.AllItems.length <= 0) {
            IFB_THROW_ERR("GNLGameDataProviderInstance.AllItems.length <= 0");
        }

        this._allItems = GNLGameDataProviderInstance.AllItems;
        this._currentItemsPack = GNLGameDataProviderInstance.GameData.itemsPack;
        
    }
    create() {

        IFB_LOG(`SCENE '${this.scene.key}' create()`);

        this._isDone = false;
        if(this._abortController) {
            this._abortController.abort();
        }
        this._abortController = new AbortController();
        this.events.on("shutdown", this.onShutdown, this);

        this._spawnedItems = [];
        this.createGameObjects();
        this.initResizables();

        EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
        EventBus.emit(GameEvents.LOADING_SCREEN_DONE);
        
        this._isReady = true;

        this.gameLoopAsync(this._abortController.signal);
    }

    onShutdown() {
        if(this._abortController) {
            this._abortController.abort();
        }
    }

    onResize(resizeData: ResizeData): void {
        
        if(!this._isReady) {
            return;
        }

        this._resizables.forEach(rsz => rsz.onResize(resizeData));
    }

    createGameObjects() {
        this._transformsArr = [];

        

        const screenCenter = ScreenCenter;

        const backgroundKey = this._currentItemsPack.isRandomBackgrounds ? IFBGetRandomElementFromArray(this._currentItemsPack.backgroundImageKeys) : this._currentItemsPack.backgroundImageKeys[1];

        const bg = this.add.image(screenCenter.x, screenCenter.y, backgroundKey);

        //подложка
        const graphics = this.add.graphics();
        // fill black
        graphics.fillStyle(0x000000, 1);
        graphics.fillRoundedRect(0, PerfectScreenSize.y / 4, PerfectScreenSize.x, PerfectScreenSize.y / 2, 25);
        graphics.alpha = 0.7;
        
        this._transformsArr.push(bg);
        this._transformsArr.push(graphics);
    }

    initResizables() {
        const screenFactor = GetCurrentScreenFactorFromScene(this);
        this._resizables.push(
            ...this._transformsArr.map((t, i) => {
                return CreateDefaultResizableGO(t, screenFactor, true)
            })
        );
    }

    private setAllItemsIsClickable(isClickable: boolean) {
        this._spawnedItems.forEach(i => i.isClickable= isClickable);
    }

    private async gameLoopAsync(signal: AbortSignal) {

        const getGuessedItem = () => this._spawnedItems.find( i => i.isGuessed);
        
        IFBTapTutorialLoopAsync(
            () => this.tweens,
            () => this.add,
            () => {
                const guess = getGuessedItem();
                if(guess) {
                    return {
                        x: guess.container.x,
                        y: guess.container.y,
                    }
                }

                return {...IFBVector2Zero};
            },
            () => {
                return GetCurrentScreenFactorFromScene(this);
            },
            () => {
                if(this._isShowGuessedProcess === true) {
                    return false;
                }
                const guess = getGuessedItem();
                if(guess) {
                    return true;
                }

                return false;
            },
            2,
            4,
            signal
        );

        let intermediateAC = new AbortController();
        while(!this._isDone) {
            if(signal.aborted) {
                return;
            }
            await this.gameProcessAsync(signal, intermediateAC.signal);
            intermediateAC.abort();
            intermediateAC = new AbortController();
        }
    }

    private async gameProcessAsync(signal: AbortSignal, intermediateSignal: AbortSignal) {

        this._isShowGuessedProcess = false;
        this._isGuessItemFound = false;
        const itemsCount = 3;
        const randomElements = IFBShuffleArray([...this._allItems]).slice(0, itemsCount);
        let itemToGuess = IFBGetRandomElementFromArray(randomElements);
        while(this._lastGuessItem && itemToGuess.uid === this._lastGuessItem.uid) {
            itemToGuess = IFBGetRandomElementFromArray(randomElements);
        }
        this._lastGuessItem = itemToGuess;
        IFB_LOG("GUESS_ITEM = " + itemToGuess.locKey);

        this.recreateElementsPack(randomElements, itemToGuess);

        let isCancelled = await IFBCancellablePromiseVoidAsync(GameServiceInstance.playVoiceAsyncBymanager("where_is_the", this.sound, signal, -0.35));
        if(isCancelled) {
            return;
        }
        isCancelled = await IFBCancellablePromiseVoidAsync(GameServiceInstance.playVoiceAsyncBymanager(itemToGuess.sfxPresentKey, this.sound, signal));
        if(isCancelled) {
            return;
        }

        this._onGuessItemClickedAction = async (item) => {
            this._isShowGuessedProcess = true;
            IFBPlayCongratsVfx({
                getObjectsFactory: () => this.add,
                getScaledScreenX: () => {
                    return PerfectScreenSize.x * GetCurrentScreenFactorFromScene(this).x
                },
                getTweenManager: () => this.tweens,
            }, intermediateSignal)

            await IFBCancellablePromiseVoidAsync(GameServiceInstance.playSoundAsyncByManager("sfx_sound_congrats", this.sound, signal, -0.5));
            await IFBCancellablePromiseVoidAsync(GameServiceInstance.playVoiceAsyncBymanager("well_done", this.sound, signal, -0.3));

            await IFBCancellablePromiseVoidAsync(GameServiceInstance.playSoundAsyncByManager(item.sfxSoundKey, this.sound, signal));
            
        }

        this.setAllItemsIsClickable(true);

        while(!this._isGuessItemFound) {
            isCancelled = await IFBCancellablePromiseVoidAsync(IFBDelayAsync(1, signal));
            if(isCancelled) {
                return;
            }
        }

        if(signal.aborted) {
            return;
        }

        await IFBCancellablePromiseVoidAsync(IFBDelayAsync(2, signal));
    }


    private recreateElementsPack(items: GNLItem[], guessItem: GNLItem) {

        for(const spawned of this._spawnedItems) {
            const index = this._resizables.indexOf(spawned.resizable);
            if (index !== -1) {
                this._resizables.splice(index, 1);
            }
            spawned.container.destroy(true);
        }
        
        this._spawnedItems = [];

        const screenFactor = GetCurrentScreenFactorFromScene(this);
        const baseAngle = 0;

        this._elemsBaseAngles = [
            baseAngle, baseAngle, baseAngle, baseAngle
        ];

        this._elemsBasePositions = [
            {...IFBVector2Zero}, {...IFBVector2Zero}, {...IFBVector2Zero}
        ];

        const elemSize = GameConfigInstance.gnrConfig.elemSize;
        const elemsOffset = GameConfigInstance.gnrConfig.elemsOffset;
        const startX = ScreenCenter.x - (elemSize.w * 1.25);


        this._itemsAbortControllers = [];
        for(let i = 0; i < items.length; i++) {
            
            const posX = startX + ( elemSize.w +  elemsOffset.x) * i;
            const posY = ScreenCenter.y;
            const dataItem = items[i];
            const abortController = new AbortController();
            this._itemsAbortControllers.push(abortController);
            const isGuessed = dataItem == guessItem;
            const [itemContainer, image] = this.createItemElement(
                dataItem, { x: posX, y: posY }, (go) => {
                    if(dataItem == guessItem) {
                        this.onGuessedItemClickedAsync(go,  dataItem, i, this._abortController.signal);
                    } else {
                        this.onItemClicked(go, dataItem, i)
                    }
                }
            )
            const resizable = CreateDefaultResizableGO(itemContainer, screenFactor, true).forceOneDimensionalScale();
            this._resizables.push(
                resizable
            );

            this._spawnedItems.push({
                container: itemContainer,
                resizable: resizable,
                itemData: dataItem,
                index: i,
                isClickable: false,
                image: image,
                isGuessed: isGuessed
            });

            this._elemsBasePositions[i] = {
                x: itemContainer.x,
                y: itemContainer.y
            }
        }
    }

    private createItemElement(item: GNLItem, initialPos: IFBVector2, onClick: (itemGO: Phaser.GameObjects.Container) => void): [Phaser.GameObjects.Container, Phaser.GameObjects.Image] {
        const graphics = this.add.graphics();
        // fill black
        graphics.fillStyle(0x000000, 1);
    
        const elemSize = GameConfigInstance.gnrConfig.elemSize;

        graphics.fillRoundedRect(-elemSize.w / 2, -elemSize.h / 2, elemSize.w, elemSize.h, 10);
        const textStr = LocProviderInstance.GetText(item.locKey);
        const text = this.add.text(0, 0, textStr ?? "???", {
            fontSize: "30px",
            color: "#0000ff"
        });

        text.setOrigin(0.5, 1);
        
        const image = this.add.image(0, 0, item.imageKey);

        const items: Phaser.GameObjects.GameObject[] = [
            graphics, image, text
        ]

        image.setOrigin(0.5, 0.5);
        graphics.visible = false;

        if(!GameConfigInstance.isDebug) {
            text.visible  = false;   
        }

        const imgScale = GameConfigInstance.gnrConfig.itemImageScale;
        image.setScale(imgScale, imgScale)

        const container = this.add.container(initialPos.x, initialPos.y, items);

        container.setInteractive(
            new Phaser.Geom.Rectangle(-elemSize.w / 2, -elemSize.h / 2, elemSize.w, elemSize.h),
            Phaser.Geom.Rectangle.Contains
        );

        container.on('pointerdown', () => {
            onClick(container);
        });

        return [container, image];  
    }

    private async onGuessedItemClickedAsync(itemGO: GameObjects.Container, gnlItem: GNLItem, index: number, signal: AbortSignal) {

        if(!this._spawnedItems[index].isClickable) {
            return;
        }

        this.setAllItemsIsClickable(false);

        let i = 1;
        for(const spawnedItem of this._spawnedItems.filter(item => item.index != index)) {
            const spawnedImage = spawnedItem.image;
            spawnedImage.setTint(0.05);
            const imgCopy = this.add.image(spawnedImage.x, spawnedImage.y, spawnedImage.texture);
            imgCopy.scale = spawnedImage.scale;
            imgCopy.setOrigin(0.5);
            imgCopy.alpha = 0.5;

            spawnedItem.container.add(imgCopy);

            itemGO.setAbove(spawnedItem.container);
            i++;
        }

        const screenCenter = ScreenCenterCopy();
        const screenFactor = GetCurrentScreenFactor(this.game.scale);
        screenCenter.x *= screenFactor.x;
        screenCenter.y *= screenFactor.y;

        const showTimeSeconds = GameConfigInstance.gnrConfig.showGuessedItemTimeSeconds;
        const targetScale = 2;
        const targetScaleVec: IFBVector2 = {
            x: targetScale * screenFactor.x,
            y: targetScale * screenFactor.y,
        };
        GameServiceInstance.playSoundAsyncByManager(gnlItem.sfxSoundKey, this.sound, signal);
        this._onGuessItemClickedAction(gnlItem);
        let isCancelled = await IFBCancellablePromiseVoidAsync(IFBRunPhaserTweenAsync(this.tweens, {
            targets: itemGO,
            duration: showTimeSeconds * 1000,
            x: screenCenter.x,
            y: screenCenter.y,
            scaleX: targetScaleVec.x,
            scaleY: targetScaleVec.y,
            ease: "Power1",
        }, signal));

        if(isCancelled) {
            return;
        }

        isCancelled = await IFBCancellablePromiseVoidAsync(IFBDelayAsync(1, signal));

        if(isCancelled) {
            return;
        }

        this._isGuessItemFound = true;
    }

    private onItemClicked(itemGO: GameObjects.Container, dataItem: GNLItem, index: number): void {
            
        if(!this._spawnedItems[index].isClickable) {
            return;
        }
        this._itemsAbortControllers[index].abort();
        const abortController = new AbortController();
        this._itemsAbortControllers[index] = abortController;
   
        const basePos = this._elemsBasePositions[index] ?? IFB_LOG_ERR("onItemClicked index item not found");
        const baseAngle = this._elemsBaseAngles[index] ?? IFB_LOG_ERR("onItemClicked index item not found");
        
        GameServiceInstance.playSoundAsyncByManager(dataItem.sfxSoundKey, this.sound, abortController.signal);

        IFBRunShakePhaserTweenAsync(
            itemGO, 
            this.tweens,
            {
                x: 25,
                y: 25
            },
            GameConfigInstance.gnrConfig.shakeDurationSeconds / SpeedMultiplier,
            () => {
                return basePos
            },
            () => baseAngle,
            abortController.signal
        );

    }

    finish() {
        if(this._isDone) {
            return;
        }
        IFB_LOG("FINISH()");
        EventBus.emit(GameEvents.SUB_LEVEL_DONE);
        this._isDone = true;
    }

}