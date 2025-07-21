import { GameObjects, Scene } from "phaser";
import { CreateDefaultResizableGO, IResizable, ResizableDataMementoResizable, ResizeData } from "../../../../ifb-utilz/ResponseInterfaces";
import { GetCurrentScreenFactor, GetCurrentScreenFactorFromScene, IFB_LOG, IFB_LOG_ERR, IFB_THROW_ERR, PerfectScreenSize, SceneNames, ScreenCenter, ScreenCenterCopy } from "../../../AppGlobals";
import { EventBus } from "../../../EventBus";
import { GameEvents } from "../../../AppGlobals";
import { GNLGameDataProviderInstance } from "./GNLGameDataProvider";
import { GNLItem, GNLItemsPack } from "./GNLGameData";
import { IFB_HEX_COLORS, IFBSize, IFBVector2 } from "../../../../ifb-utilz/IFBMath";
import { IFBCancellablePromiseVoidAsync, IFBDelayAsync, IFBIsCancelledException } from "../../../../ifb-utilz/IFBAsyncs";
import { GameConfigInstance, IFBHexColorPallete } from "../../../../GameConfig";
import { IFBPlayLevelFinishEffectAsync, IFBRunPhaserTweenAsync, IFBShowTapTipAsync } from "../../../GameUtils";
import { IFBGetRandomElementFromArray, IFBShuffleArray } from "../../../../ifb-utilz/IFBUtils";
import { GameServiceInstance } from "../../../GameService";

type ProgressBarInitialData = {
    position: IFBVector2,
    size: IFBSize,
}

type BarImageMiniItem = {
    itemData: GNLItem,
    uid: number,
    image: Phaser.GameObjects.Image,
    isActivated: boolean,
}

type ObstaclePositionContainer = {
    isLeft: boolean,
    position: IFBVector2,
    container: GameObjects.Container
}

type ClickableGameItem = {
    isClickable: boolean,
    itemData: GNLItem,
    itemContainer: GameObjects.Container,
    itemImage: GameObjects.Image,
    isClicked: boolean,
    obstacle: ObstaclePositionContainer
}

export class GNLThirdSeek extends Scene implements IResizable {

    private _backgroundImage: GameObjects.Image;
    private _resizableMemento: ResizableDataMementoResizable;
    private _resizables: IResizable[];
    private _isReady: boolean = false;
    private _abortController: AbortController;
    private _currentItemsPack: GNLItemsPack;
    private _progressBarContainer: GameObjects.Container;
    private _progressBarInitialData: ProgressBarInitialData = {
        position: {
            x: ScreenCenter.x,
            y: 200,
        },
        size: {
            w: 400,
            h: 100
        }
    }

    private _barItems: BarImageMiniItem[];
    private _obstaclesContainersArr: GameObjects.Container[];
    private _obstaclePositionsArr: ObstaclePositionContainer[];
    private _gameItemContainerArr: GameObjects.Container[];
    private _clickableGameItemsArr: ClickableGameItem[];
    private _isDone: boolean;
    private _isItemClickProcessing: boolean;

    constructor() {
        super(SceneNames.GAME_GUESS_N_LEARN_2);
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

        if(GNLGameDataProviderInstance.GameData.itemsPack.obstacles.length <= 0) {
            IFB_THROW_ERR("GNLGameDataProviderInstance.GameData.itemsPack.obstacles.length <= 0");
        }

        this._currentItemsPack = GNLGameDataProviderInstance.GameData.itemsPack;

    }
    create() {

        IFB_LOG(`SCENE '${this.scene.key}' create()`);

        this._isDone = false;
        
        if(this._abortController) {
            this._abortController.abort();
        }

        this._abortController = new AbortController();

        //begin: init data
        // ...
        //end

        this.createGameObjects();
        this.initResizables();
        

        this.events.on("shutdown", this.onShutdown, this);
        EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
        EventBus.emit(GameEvents.LOADING_SCREEN_DONE);
        

        this.detectWinAsync(this._abortController.signal);

        this.tutorialLoopAsync(this._abortController.signal);

        this._isReady = true;
    }

    private async tutorialLoopAsync(signal: AbortSignal) {
        
        const getIsDone = () => {
            return this._isDone;
        }

        await GameServiceInstance.playVoiceAsyncBymanager("lets_find_hidden", this.sound, signal, -0.5);

        let tutorialAbortController = new AbortController();
        let isWasClicked = false;
        const onPointerDown = () => {
            isWasClicked = true;
            tutorialAbortController.abort();
            tutorialAbortController = new AbortController();
        }
        window.addEventListener("pointerdown", onPointerDown);

        const onCancel = () => {
            tutorialAbortController.abort();
            window.removeEventListener("pointerdown", onPointerDown);
        }

        const delaySeconds = 3;
        let isAborted = false;
        while(!signal.aborted) {
            if(getIsDone()) {
                onCancel();
                return;
            }

            isAborted = await IFBCancellablePromiseVoidAsync(IFBDelayAsync(delaySeconds, signal));
            if(isAborted) {
                onCancel();
                return;
            }

            if(this._isItemClickProcessing) {
                continue;
            }

            //IFB_LOG("DETECT, wasClicked: " + isWasClicked);
            if(isWasClicked) {
                isWasClicked = false;
                continue;
            }

            const anyNotClickedItem = this._clickableGameItemsArr.find(i => ! i.isClicked)?.itemContainer;

            if(!anyNotClickedItem) {
                continue;
            }

            await IFBCancellablePromiseVoidAsync(IFBShowTapTipAsync({
                getTweenManager: () => this.tweens,
                createGoFactory: () => this.add,
                getTimeToShow: () => 1,
                getPosToShow: () => {
                    return {
                        x: anyNotClickedItem.x,
                        y: anyNotClickedItem.y
                    }
                },
                getScreenFactor: () => {
                    return GetCurrentScreenFactorFromScene(this);
                }
            }, tutorialAbortController.signal));
            
        }
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

    private createGameObjects() {
        const screenCenter = ScreenCenterCopy();
        const screenSize = PerfectScreenSize;

        this._backgroundImage = this.add.image(screenCenter.x, screenCenter.y, this._currentItemsPack.backgroundImageKeys[1]);

        //begin: progress-bar
        {   
            const progressBarSize = this._progressBarInitialData.size;
            const progressBarInitialPos = this._progressBarInitialData.position;

            const graphicsFill = this.add.graphics();
            graphicsFill.fillStyle(IFBHexColorPallete.BACKGROUND, 0.5);
            graphicsFill.lineStyle(2, IFB_HEX_COLORS.BLACK);
            graphicsFill.strokeRoundedRect(-progressBarSize.w / 2, -progressBarSize.h / 2, progressBarSize.w, progressBarSize.h, 5);
            graphicsFill.fillRoundedRect(-progressBarSize.w / 2, -progressBarSize.h / 2, progressBarSize.w, progressBarSize.h, 5);

            const items: GameObjects.GameObject[] = [];
            this._barItems = [];
          
            let i = 0;
            for(const item of this._currentItemsPack.items) {

                const barItem = this.createItemMiniature(
                        item,
                        i,
                    );
                items.push(
                    barItem.image
                );

                this._barItems.push(barItem);
                this.setIsBarItemActive(barItem, false);
                i++;
            }

            this._progressBarContainer = this.add.container(progressBarInitialPos.x, progressBarInitialPos.y, [graphicsFill, ...items]);
        } 


        //creat obstacles
        {
            this._obstaclePositionsArr = [];
            this._obstaclesContainersArr = [];
            const obstaclesCount = 4;

            const offsetX = 320;
            const offsetY = 350;
            IFB_LOG("OFFSET_X -> " + offsetX);

            const positions: IFBVector2[] = [
                {
                    x: screenCenter.x - (offsetX * 2),
                    y: screenCenter.y + (offsetY * 0.6)
                },
                {
                    x: screenCenter.x - (offsetX * 0.8),
                    y: screenCenter.y + (offsetY * 0.1)
                },
                {
                    x: screenCenter.x + (offsetX * 0.8),
                    y: screenCenter.y + (offsetY * 0.1)
                },
                {
                    x: screenCenter.x + (offsetX * 2),
                    y: screenCenter.y + (offsetY * 0.6)
                }   
            ];
            const obstaclesArr = IFBShuffleArray([...this._currentItemsPack.obstacles]);
            for(let i = 0; i < obstaclesCount; i++) {
                const obstacleData = i >= obstaclesArr.length  ? obstaclesArr[obstaclesArr.length - 1] : obstaclesArr[i];

                IFB_LOG("Process obstacle: " + obstacleData.textureName);

                const pos = positions.pop() ?? screenCenter;

                const obstacleContainer = this.createObstacle(obstacleData.textureName, pos, {
                    x: obstacleData.scale,
                    y: obstacleData.scale
                }, i);

                this._obstaclesContainersArr.push(obstacleContainer);

                const offsetFromCenter = 150;
                this._obstaclePositionsArr.push(
                    {
                        isLeft: true,
                        position: {
                           
                            x: pos.x - offsetFromCenter,
                            y: pos.y,
                        },
                        container: obstacleContainer
                    },
                    {
                        isLeft: false,
                        position: {
                           
                            x: pos.x + offsetFromCenter,
                            y: pos.y,
                        },
                        container: obstacleContainer
                    }
                );
            }
        }

        {
            const uniqueObstaclesPosArr = this._obstaclesContainersArr.map((o) => {
                const positionsRelated = this._obstaclePositionsArr.filter(op => op.container == o);
                return IFBGetRandomElementFromArray(positionsRelated);
            });

            this._gameItemContainerArr = [];
            this._clickableGameItemsArr = [];
            for(const gameItemData of this._currentItemsPack.items) {
                const obstaclesPos = uniqueObstaclesPosArr.pop() ?? {
                    isLeft: true,
                    position: screenCenter,
                    container: IFBGetRandomElementFromArray(this._obstaclesContainersArr)
                };
                const [gameItemContainer, itemImage] = this.createItemBehindObstacle(gameItemData, obstaclesPos);
                this._gameItemContainerArr.push(gameItemContainer);

                const itemSize: IFBSize = {
                    w: 500,
                    h: 500
                }
                gameItemContainer.setInteractive(
                    new Phaser.Geom.Rectangle(-itemSize.w / 2, -itemSize.h / 2, itemSize.w, itemSize.h),
                    Phaser.Geom.Rectangle.Contains
                );

                const clickableItem: ClickableGameItem = {
                    itemData: gameItemData,
                    itemContainer: gameItemContainer,
                    itemImage: itemImage,
                    isClicked: false,
                    obstacle: obstaclesPos,
                    isClickable: true,
                }

                gameItemContainer.on('pointerdown', () => {
                    this.handleOnItemClicked(clickableItem);
                });

                this._clickableGameItemsArr.push(clickableItem);
            }
        }
    }


    private initResizables() {
        const screenFactor = GetCurrentScreenFactorFromScene(this);
        this._resizables.push(
            CreateDefaultResizableGO(this._backgroundImage, screenFactor),
            CreateDefaultResizableGO(this._progressBarContainer, screenFactor),

            ...this._obstaclesContainersArr.map((i) => CreateDefaultResizableGO(i, screenFactor, true).forceOneDimensionalScale()),

            ...this._gameItemContainerArr.map((i) => CreateDefaultResizableGO(i, screenFactor, true).forceOneDimensionalScale()),
        );
    }

    private createItemMiniature(itemData: GNLItem, index: number): BarImageMiniItem {

        const offset = 100;
        const startXPos = -150;
        const xPos = startXPos + (offset * index);
        const img = this.add.image(xPos, 0, itemData.imageKey);
        img.setOrigin(0.5, 0.5);
        const scale = 0.18;
        img.setScale(scale, scale);
        
        return {
            itemData: itemData,
            uid: index,
            image: img,
            isActivated: false,
        };
    }

    private createObstacle(obstacleImageKey: string, pos: IFBVector2, scale: IFBVector2, index: number) {

        const startXPos = pos.x;
        const startYPos = pos.y;
        const img = this.add.image(0, 0, obstacleImageKey);
        img.setScale(scale.x, scale.y);
        
        img.setOrigin(0.5, 0.5);
        const container = this.add.container(startXPos, startYPos, img);
    
        return container;
    }

    private createItemBehindObstacle(itemData: GNLItem, obstaclePos: ObstaclePositionContainer): [GameObjects.Container, GameObjects.Image] {

        const image = this.add.image(0, 0, itemData.imageKey);
        image.setOrigin(0.5, 0.5);
        const container = this.add.container(obstaclePos.position.x, obstaclePos.position.y, image);
        if(obstaclePos.isLeft) {
            image.setFlipX(true);
        }
        container.setBelow(obstaclePos.container);
        const scale = 0.4;
        container.setScale(scale, scale);
        return [container, image];
    }

    private setIsBarItemActive(barItem: BarImageMiniItem, isActive: boolean): BarImageMiniItem {

        const tintColor = isActive ? IFB_HEX_COLORS.WHITE : IFB_HEX_COLORS.BLACK;
        barItem.image.setTint(tintColor);
        barItem.isActivated = isActive;
        return barItem;
    }

    private handleOnItemClicked(clickableItem: ClickableGameItem) {
        if(!clickableItem.isClickable) {
            return;
        }
        if(clickableItem.isClicked) {
            return;
        }
        IFB_LOG(`ITEM '${clickableItem.itemData.locKey}' CLICK!`);
        this._isItemClickProcessing = true;
        this.setAllItemsIsClickable(false);
        clickableItem.isClicked = true;
        this.showItemAsync(clickableItem, this._abortController.signal).then(() => {
            this.setAllItemsIsClickable(true);
            this._isItemClickProcessing = false; 
        }).catch(ex => {
            if(IFBIsCancelledException(ex)) {
                return;
            }

            IFB_LOG_ERR(ex);
        });
    }

    private setAllItemsIsClickable(isClickable: boolean) {
        for(const clickableItem of this._clickableGameItemsArr) {
            clickableItem.isClickable = isClickable;
        }
    }

    private async showItemAsync(clickableItem: ClickableGameItem, signal: AbortSignal) {

        // play sound
        // show
        // fill progress

        // targets: gameItem, // любой GameObject: sprite, container, text
        // alpha: 1,
        // duration: showTimeSeconds * 1000, // длительность в миллисекундах
        // ease: 'Linear', // можно попробовать 'Power1', 'Sine', 'Cubic', 'Elastic', 'Bounce'

        const playAsyncSoundAsync = async (key: string) => {
            return GameServiceInstance.playSoundAsyncByManager(key, this.sound, signal);
        }

        const playSoundsAsync = async () => {
            await playAsyncSoundAsync(clickableItem.itemData.sfxSoundKey);
            await playAsyncSoundAsync(clickableItem.itemData.sfxSoundKey);
        }
        
        playSoundsAsync();

        const {itemContainer, obstacle} = clickableItem;

        const showTimeSeconds = GameConfigInstance.gnrConfig.showHiddenItemTimeSeconds;
        const fillProgressTimeSeconds = GameConfigInstance.gnrConfig.fillProgressItemTimeSeconds;

        itemContainer.setAbove(obstacle.container);

        this._clickableGameItemsArr.forEach(i => {
            if(i === clickableItem) {
                return;
            }
            itemContainer.setAbove(i.itemContainer);
        })

        const screenCenter = ScreenCenterCopy();
        const screenFactor = GetCurrentScreenFactor(this.game.scale);
        screenCenter.x *= screenFactor.x;
        screenCenter.y *= screenFactor.y;
        // this.tweens.add({
        //     targets: itemContainer,
        //     x: 5,
        //     y: 10,
        //     scaleXZ: 10,
        // });

        const targetScale = 1.5;
        const targetScaleVec: IFBVector2 = {
            x: targetScale * screenFactor.x,
            y: targetScale * screenFactor.y,
        };
        await IFBRunPhaserTweenAsync(this.tweens, {
            targets: itemContainer,
            duration: showTimeSeconds * 1000,
            x: screenCenter.x,
            y: screenCenter.y,
            scaleX: targetScaleVec.x,
            scaleY: targetScaleVec.y,
            ease: "Power1",
        }, signal);

    
        await IFBDelayAsync(0.5, this._abortController.signal);

        const barItem = this._barItems.find((i) => i.itemData === clickableItem.itemData);

        if(barItem) {

            const relativePos: IFBVector2 = {
                x: this._progressBarContainer.x + barItem.image.x,
                y: this._progressBarContainer.y + barItem.image.y,
            }

            clickableItem.itemImage.flipX = barItem.image.flipX;
            
            await IFBRunPhaserTweenAsync(this.tweens, {
                    targets: itemContainer,
                    duration: fillProgressTimeSeconds * 1000,
                    x: relativePos.x,
                    y: relativePos.y,
                    scaleX: barItem.image.scaleX,
                    scaleY: barItem.image.scaleY,
                    ease: "Power1",
                }, 
                signal
            );

            this.setIsBarItemActive(barItem, true);
        } else {
            IFB_LOG_ERR("bar item is not found!");
        }

        clickableItem.itemContainer.setActive(false);
        clickableItem.itemContainer.setVisible(false);

        //TODO: Wait, hide, progress bar
    }

    private async detectWinAsync(signal: AbortSignal) {
        let isWin: boolean = false;

        while(!isWin) {

            if(this._barItems) {
                isWin = this._barItems.every(bi => bi.isActivated);
            }
             
            try {
                await IFBDelayAsync(1, signal);
            } catch(ex) {
                if(IFBIsCancelledException(ex)) {
                    return;
                }
            }
        }

        IFB_LOG("YOU WIN!");

        await IFBPlayLevelFinishEffectAsync(this.sound, {
            getObjectsFactory: () => this.add,
            getTweenManager: () => this.tweens,
            getScaledScreenX: () => {
                return PerfectScreenSize.x * GetCurrentScreenFactorFromScene(this).x;
            },
        }, this._abortController.signal, () => {
            this.finish();
        });
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