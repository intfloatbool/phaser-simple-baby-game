import { IFBCancellablePromiseVoidAsync, IFBDelayAsync, IFBIsCancelledException, IFBOpCancelledException } from "../ifb-utilz/IFBAsyncs";
import { IFBVector2 } from "../ifb-utilz/IFBMath";
import { IFB_LOG, IFB_LOG_ERR } from "./AppGlobals";
import { GameServiceInstance } from "./GameService";

type vfxParams = {
    getObjectsFactory: () => Phaser.GameObjects.GameObjectFactory,
    getTweenManager: () => Phaser.Tweens.TweenManager,
    getScaledScreenX: () => number,
}

export const IFBPlayLevelFinishEffectAsync = async (soundManager:  Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager, vfxp: vfxParams, signal: AbortSignal, onDone: () => void) => {

    try {

        IFBPlayCongratsVfx(vfxp, signal);
        await GameServiceInstance.playSoundAsyncByManager("sfx_sound_congrats", soundManager, signal)

        if(signal.aborted) {
            return;
        }
        
        GameServiceInstance.playVoiceAsyncBymanager("well_done", soundManager, signal)

    } catch(ex) {
        if(IFBIsCancelledException(ex)) {
            return;
        }
        IFB_LOG_ERR("[PlayLevelFinishEffectAsync] err! -> " + ex);
    }

    if(signal.aborted) {
        return;
    }

    onDone();
}

export function IFBPlayCongratsVfx(params: vfxParams, signal: AbortSignal) {
    const startX = 100;
    const endX = params.getScaledScreenX();
    const repeat = 5;

    const emitter = params.getObjectsFactory()
        .particles(startX, 30, 'bubbles', {
            frame: [ 'bluebubble', 'redbubble', 'greenbubble', 'silverbubble' ],
            scale: { min: 0.25, max: 1 },
            rotate: { start: 0, end: 360 },
            speed: { min: 50, max: 100 },
            lifespan: 6000,
            frequency: 50,
            gravityY: 90
        });

    const tween = params.getTweenManager().add({
        targets: emitter,
        particleX: endX,
        yoyo: false,
        repeat: repeat,
        ease: 'sine.inout',
        duration: 1500
    });

    const onCancel = () => {
        if(tween) {
            tween.stop();
            tween.destroy();
        }
        if(emitter) {
            
            emitter.destroy();
        }
    }

    signal.addEventListener("abort" ,() => {
        onCancel();
    });

    IFBCancellablePromiseVoidAsync(IFBDelayAsync(10, signal)).then(() => {
        onCancel();
    })
}

type ToolTipShowParams = {
    getTweenManager: () => Phaser.Tweens.TweenManager,
    createGoFactory: () => Phaser.GameObjects.GameObjectFactory,
    getTimeToShow: () => number,
    getPosToShow: () => IFBVector2,
    getScreenFactor: () => IFBVector2,

}

export const IFBTapTutorialLoopAsync = async (getTweens: () => Phaser.Tweens.TweenManager, getGoFactory: () => Phaser.GameObjects.GameObjectFactory, getPosition: () => IFBVector2, getScreenFactor: () => IFBVector2, getIsReady: () => boolean, initialDelaySeconds: number, delaySeconds: number, mainAbortSignal: AbortSignal) => {

    let isAborted = await IFBCancellablePromiseVoidAsync(IFBDelayAsync(initialDelaySeconds, mainAbortSignal));
    if(isAborted) {
        return;
    }
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

    mainAbortSignal.addEventListener("abort", () => {
        onCancel();  
    });

    while(!mainAbortSignal.aborted) {
        isAborted = await IFBCancellablePromiseVoidAsync(IFBDelayAsync(delaySeconds, mainAbortSignal));
        if(isAborted) {
            onCancel();
            return;
        }

        if(!getIsReady()) {
            continue;
        }

        //IFB_LOG("DETECT, wasClicked: " + isWasClicked);
        if(isWasClicked) {
            isWasClicked = false;
            continue;
        }

        await IFBCancellablePromiseVoidAsync(IFBShowTapTipAsync({
            getTweenManager: getTweens,
            createGoFactory: getGoFactory,
            getTimeToShow: () => 1,
            getPosToShow: getPosition,
            getScreenFactor: getScreenFactor
        }, tutorialAbortController.signal));
        
    }
}

export const IFBShowTapTipAsync = async (params: ToolTipShowParams, signal: AbortSignal) => {

        let isCancelled = await IFBCancellablePromiseVoidAsync(IFBDelayAsync(1, signal));
        if(isCancelled) {
            return;
        }
        
        const baseScale = 0;
        const screenFactor = params.getScreenFactor();
        const targetScale = 0.3 * screenFactor.x;
        const offsetX = 50 * screenFactor.x;
        const offsetY = 50 * screenFactor.y;
        const posCopy = {...params.getPosToShow()};

        const img = params.createGoFactory().image(posCopy.x + offsetX, posCopy.y + offsetY, "tap_to_screen_tip"); 

        signal.addEventListener("abort", () => {
            img.visible = false;
        });

        const onCancel = () => {
            img.destroy();
        }

        const timeToShow = params.getTimeToShow();

        img.scale = baseScale;
        isCancelled = await IFBCancellablePromiseVoidAsync(IFBRunPhaserTweenAsync(params.getTweenManager(), {
            targets: img,
            duration: timeToShow * 1000,
            scaleX: targetScale,
            scaleY: targetScale,
            ease: "Bounce",
        }, signal));
        
        if(isCancelled) {
            onCancel();
            return;
        }

        isCancelled = await IFBCancellablePromiseVoidAsync(IFBDelayAsync(1, signal));
        if(isCancelled) {
            onCancel();
            return;
        }

        isCancelled = await IFBCancellablePromiseVoidAsync(IFBRunPhaserTweenAsync(params.getTweenManager(), {
            targets: img,
            duration: timeToShow * 0.5 * 1000,
            scaleX: baseScale,
            scaleY: baseScale,
            ease: "Linear",
        }, signal));

        if(isCancelled) {
            onCancel();
            return;
        }

        img.destroy(true);
}


export const IFBTransformToVec2Position = (transform: Phaser.GameObjects.Components.Transform): IFBVector2 => {
    return {
        x: transform.x,
        y: transform.y
    }
}

export const IFBRunPhaserTweenAsync = async (tweenManager: Phaser.Tweens.TweenManager, cfg: any, signal: AbortSignal): Promise<void> => {
    const tween = tweenManager.add(cfg);
    try {
        while(tween.isPlaying()) {
            await IFBDelayAsync(0.1, signal);
            continue;
        }
    } catch(ex) {
        if(ex instanceof IFBOpCancelledException) {
            tween.stop();
        }
        throw ex;
    }
}

const randomAngles = [
    "+=5",
    "-=5",
    "+=10",
    "-=10",
    "-=15",
    "+=15",
];

const getRndAngleStr = () => randomAngles[ Math.floor( Math.random() * randomAngles.length ) ];

export const IFBRunShakePhaserTweenAsync = async (go: Phaser.GameObjects.Components.Transform, tweenManager: Phaser.Tweens.TweenManager, strength: IFBVector2, durationSeconds: number, getPos: () => IFBVector2, getAngle:() => number, signal: AbortSignal) => {

    const originalX = getPos().x;
    const originalY = getPos().y;
    const originalAngle = getAngle();

    try {
        await IFBDelayAsync(0.1, signal);

        const rndAngle = getRndAngleStr();
        await IFBRunPhaserTweenAsync(tweenManager, {
                targets: go,
                x: originalX - strength.x,
                y: originalY - strength.y,
                angle: rndAngle,
                duration: 0.2 * 1000,
                ease: 'Sine.easeInOut'
            }, signal);

        await IFBRunPhaserTweenAsync(tweenManager, {
            targets: go,
            angle: rndAngle,
            x: { from: originalX - strength.x, to: originalX + strength.x },
            y: { from: originalY - strength.y, to: originalY + strength.y },
            duration: durationSeconds * 1000,
            yoyo: true,
            //repeat: 1,
            ease: 'Sine.easeInOut',
        }, signal);

        const returnTime = 0.3;
        await IFBRunPhaserTweenAsync(tweenManager, {
            targets: go,
            x: originalX,
            y: originalY,
            angle: originalAngle,
            duration: returnTime * 1000,
            //yoyo: true,
            ease: 'Sine.easeInOut'
        }, signal);

    } catch(ex) {
        if(IFBIsCancelledException(ex)) {
            if(!go) {
                return;
            }

            go.setX(originalX);
            go.setY(originalY);
            go.setAngle(originalAngle);
            
        } else {
            throw ex;
        }
    }
    
    
}