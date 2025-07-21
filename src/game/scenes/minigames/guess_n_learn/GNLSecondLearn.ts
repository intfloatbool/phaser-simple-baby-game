import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../../../EventBus';
import { IFB_HEX_COLORS, IFBSize, IFBVector2 } from '../../../../ifb-utilz/IFBMath';
import { CreateResiableGO, IResizable, ResizableDataMementoResizable, ResizableGO, ResizeData } from '../../../../ifb-utilz/ResponseInterfaces';
import { GetCurrentScreenFactorFromScene, IFB_LOG, IFB_LOG_ERR, IFB_LOG_EX, IFB_LOG_NOT_IMPLEMENTED_ERR, IFB_THROW_ERR, PerfectScreenSize, SceneNames, ScreenCenter } from '../../../AppGlobals';
import { GameEvents } from '../../../AppGlobals';
import { GNLGameDataProviderInstance } from './GNLGameDataProvider';
import { GNLItem, GNLItemsPack } from './GNLGameData';
import { IFBCancellablePromiseVoidAsync, IFBDelayAsync, IFBOpCancelledException } from '../../../../ifb-utilz/IFBAsyncs';
import { LocProviderInstance } from '../../../../services/localization/LocProvider';
import { GameConfigInstance, SpeedMultiplier } from '../../../../GameConfig';
import { IFBPlayLevelFinishEffectAsync, IFBRunPhaserTweenAsync, IFBRunShakePhaserTweenAsync } from '../../../GameUtils';
import { GameServiceInstance } from '../../../GameService';

type itemPair = {
    dataItem: GNLItem,
    gameItem: GameObjects.Container | null,
    abortController: AbortController
};


export class GNLSecondLearn extends Scene implements IResizable
{
    private _background: GameObjects.Image;

    private _isReady: boolean = false;
    private _resizables: IResizable[]
    private _resizableMemento: ResizableDataMementoResizable;
    private _currentItemsPack: GNLItemsPack;
    private _abortController: AbortController;
    private _itemParisArr: itemPair[];
    private _elemsBasePositions: IFBVector2[];
    private _elemsOptimizedBasePositions: IFBVector2[];
    private _elemsBaseAngles: number[];
    private _isItemsInteractable: boolean[];
    private _isDone: boolean = false;
    private _backGraphics: GameObjects.Graphics;
    private _itemsAbortControllers: AbortController[];

    constructor ()
    {
        super(SceneNames.GAME_GUESS_N_LEARN_1);
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

        this._currentItemsPack = GNLGameDataProviderInstance.GameData.itemsPack;
    }
    
    create ()
    {
        IFB_LOG(SceneNames.GAME_GUESS_N_LEARN_1);

        this._isDone = false;
        this._isItemsInteractable = [
            false,
            false,
            false,
            false,
        ];

        const elemSize = GameConfigInstance.gnrConfig.elemSize;
        const elemsOffset = GameConfigInstance.gnrConfig.elemsOffset;

        const baseAngle = 0;

        this._elemsBaseAngles = [
            baseAngle, baseAngle, baseAngle, baseAngle
        ];

        this._elemsBasePositions = [];

        const startX = GameConfigInstance.gnrConfig.learnItemStartSpawnPosX;
        for(let i = 0; i < 4; i++) {
            const posX = startX + ( elemSize.w +  elemsOffset.x) * i;
            const posY = PerfectScreenSize.y / 2;
            this._elemsBasePositions.push({
                x: posX,
                y: posY
            });
        }


        this.createGameObjects();
        this.initResizables();
        
        if(this._abortController) {
            this._abortController.abort();
        }
        this._abortController = new AbortController();

        this.events.on("shutdown", this.onShutdown, this);
        this._resizableMemento.tryRestoreResizing(this);
        this._isReady = true;
        EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
        EventBus.emit(GameEvents.LOADING_SCREEN_DONE);

        this.delayedStartAsync();
    }

    onShutdown() {
        //IFB_LOG(`scene ${this.scene.key} shutdowned.`);
        this._abortController.abort();
    }

    private createGameObjects(): void {
        const screenCenter = ScreenCenter;
        this._background = this.add.image(screenCenter.x, screenCenter.y, this._currentItemsPack.backgroundImageKeys[0]);
        
        this._background.setScale(1, 1);

        this._itemParisArr = [];
        let i = 0;
        const maxElems = 4;

        //подложка
        const graphics = this.add.graphics();
        // fill black
        graphics.fillStyle(0x000000, 1);
        graphics.fillRoundedRect(0, PerfectScreenSize.y / 4, PerfectScreenSize.x, PerfectScreenSize.y / 2, 25);
        graphics.alpha = 0.7;
        this._backGraphics = graphics;

        this._itemsAbortControllers = [];
        
        for(const item of this._currentItemsPack.items) {
            if(i >= maxElems) {
                break;
            }
            const abortController = new AbortController();
            const itemPair: itemPair = {
                dataItem: item,
                gameItem: null,
                abortController: abortController,
            }
            this._itemsAbortControllers.push(abortController);
            const indexCopy = new Number(i);
            const elem = this.createItemElement(item, i, (itemGO) => {
                this.onItemClicked(itemGO, itemPair.dataItem, indexCopy as number);
            });
                

            itemPair.gameItem = elem;
            
            this._itemParisArr.push(itemPair);
            i++;
        }
    }

    private onItemClicked(itemGO: GameObjects.Container, dataItem: GNLItem, index: number): void {
        
        if(this._isItemsInteractable[index] === false) {
            return;
        }

        this._itemsAbortControllers[index].abort();
        const abortController = new AbortController();
        this._itemsAbortControllers[index] = abortController;

        const basePos = this._elemsOptimizedBasePositions[index] ?? IFB_LOG_ERR("onItemClicked index item not found");
        const baseAngle = this._elemsBaseAngles[index] ?? IFB_LOG_ERR("onItemClicked index item not found");
        
        IFBCancellablePromiseVoidAsync(GameServiceInstance.playSoundAsyncByManager(dataItem.sfxSoundKey,this.sound, abortController.signal));

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

    private initResizables(): void {
        const screenFactor = GetCurrentScreenFactorFromScene(this);

         this._resizables.push(new ResizableGO(
            {
                x: this._background.x,
                y: this._background.y
            },
            {
                x: this._background.scaleX,
                y: this._background.scaleY
            },

            (x, y) => {
                this._background.setPosition(x, y);
            },
            (x, y) => {
                this._background.setScale(x, y)
            },

            true
        ).resizeByCurrentScreenFactor(screenFactor));

        this._resizables.push(CreateResiableGO(
            {
                x: this._backGraphics.x,
                y: this._backGraphics.y,
            },
            {
                x: this._backGraphics.scaleX,
                y: this._backGraphics.scaleY,
            },
            (x, y) => {
                this._backGraphics.setPosition(x,y);
            },
            (x, y) => {
                this._backGraphics.setScale(x, y);
            },
            true
        ).resizeByCurrentScreenFactor(screenFactor));

        this._elemsOptimizedBasePositions = [];
        let i = 0;
        for(const itemPair of this._itemParisArr) {
            const item = itemPair.gameItem;
            if(!item) {
                IFB_LOG_ERR("ITEM IS NULL!");
                continue;
            }
            this._resizables.push(new ResizableGO(
                {
                    x: item.x,
                    y: item.y
                },
                {
                    x: item.scaleX,
                    y: item.scaleY
                },

                (x, y) => {
                    item.setPosition(x, y);
                },
                (x, y) => {
                    item.setScale(x, y)
                },

                true

                ).resizeByCurrentScreenFactor(screenFactor).forceOneDimensionalScale()
            );
            this._elemsOptimizedBasePositions[i] = {
                x: item.x,
                y: item.y
            }
            i++;
        }

    }

    private createItemElement(item: GNLItem, index: number, onClick: (itemGO: Phaser.GameObjects.Container) => void): Phaser.GameObjects.Container {
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

        const initialPos: IFBVector2 = this._elemsBasePositions[index];

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
        
        container.alpha = 0;

        container.setInteractive(
            new Phaser.Geom.Rectangle(-elemSize.w / 2, -elemSize.h / 2, elemSize.w, elemSize.h),
            Phaser.Geom.Rectangle.Contains
        );

        container.on('pointerdown', () => {
            onClick(container);
        });

        return container;  
    }

    private async delayedStartAsync(): Promise<void> {
        const signal = this._abortController.signal;
        try {
            await GameServiceInstance.playVoiceAsyncBymanager("lets_meet", this.sound, signal, -0.5);
            if(signal.aborted) {
                return;
            }
            await GameServiceInstance.playVoiceAsyncBymanager(this._currentItemsPack.presentSfxKey, this.sound, signal);

            // start queue
            let index = 0;
            for(const itemPair of this._itemParisArr) {
                await this.presentItemAsync(itemPair, signal);
                this._isItemsInteractable[index] = true;
                index++;
            }

            await IFBPlayLevelFinishEffectAsync(this.sound, {
                getObjectsFactory: () => this.add,
                getTweenManager: () => this.tweens,
                getScaledScreenX: () => PerfectScreenSize.x * GetCurrentScreenFactorFromScene(this).x,
            }, signal, () => {
                this.finish();
            });


        } catch(ex) {
            if(ex instanceof IFBOpCancelledException) {
                //cacnel handling
                return;
            }
            IFB_LOG_EX(ex as Error);
        }
        IFB_LOG("SCENE GNL delayedStartAsync() done");
    }

    async presentItemAsync(itemPair: itemPair, signal: AbortSignal) {

        const gameItem = itemPair.gameItem;
        if(!gameItem) {
            IFB_LOG_ERR("presentItemAsync() GameItem is null!");
            return;
        }
        // Show animations

        const showTimeSeconds = GameConfigInstance.gnrConfig.learnItemShowTime;
        const waitBetweenTimeSeconds = GameConfigInstance.gnrConfig.learnItemWaitBetweenTime;
        const shakeDurationTimeSeconds = GameConfigInstance.gnrConfig.shakeDurationSeconds;

        // show
        await IFBRunPhaserTweenAsync(this.tweens,
            {
                targets: gameItem, // любой GameObject: sprite, container, text
                alpha: 1,
                duration: showTimeSeconds * 1000, // длительность в миллисекундах
                ease: 'Linear', // можно попробовать 'Power1', 'Sine', 'Cubic', 'Elastic', 'Bounce'
            },
            signal
        );

        const playAsyncSoundAsync = async (key: string) => {
            return GameServiceInstance.playSoundAsyncByManager(key, this.sound, signal);
        }

        await GameServiceInstance.playVoiceAsyncBymanager(itemPair.dataItem.sfxPresentKey, this.sound, signal);

        playAsyncSoundAsync(itemPair.dataItem.sfxSoundKey);

        // shake
        await IFBRunShakePhaserTweenAsync(
            gameItem, 
            this.tweens,
            {
                x: 25,
                y: 25
            },
            shakeDurationTimeSeconds,
            () => {
                return {
                    x: gameItem.x,
                    y: gameItem.y
                }
            },
            () => gameItem.angle,
            signal
        );

        // delay between show and hide
        await IFBDelayAsync(waitBetweenTimeSeconds, signal);

    }


    finish() {
        if(this._isDone) {
            return;
        }
        IFB_LOG("FINISH()");
        EventBus.emit(GameEvents.SUB_LEVEL_DONE);
        this._isDone = true;
    }

    

    onResize(resizeData: ResizeData): void {
        
        if(!this._isReady) {
            return;
        }

        this._resizables.forEach(rsz => rsz.onResize(resizeData));
    }

}
