import { useEffect, useState } from "react"
import { GameServiceInstance, LanguageType } from "../../game/GameService"

type SettingsRCProps = {

}

export const SettingsRC: React.FC<SettingsRCProps> = (props) => {
    
    const [isMusicMuted, setIsMusicMuted] = useState<boolean>(GameServiceInstance.isMusicMuted());

    const [currentLanguage, setCurrentLanguage] = useState<LanguageType>(GameServiceInstance.getCurrentLanguage());


    useEffect(() => {
        GameServiceInstance.setIsMusicMuted(isMusicMuted);
    }, [isMusicMuted]);

    useEffect(() => {
        GameServiceInstance.setCurrentLanguage(currentLanguage);
    }, [currentLanguage]);

    const toggleMusicImageSrc = isMusicMuted ? "./svgs/music-off.svg" : "./svgs/music-notes.svg";

    const toggleLanguageImageSrc = currentLanguage === LanguageType.RU ? "./svgs/flag-ru.svg" : "./svgs/flag-us.svg";

    const onLanguageClick = () => {
        const targetLanguage = currentLanguage === LanguageType.RU ? LanguageType.EN : LanguageType.RU;
        setCurrentLanguage(targetLanguage);
    }

    const onMusicClick = () => {
        setIsMusicMuted(!isMusicMuted);
    }

    return (
        <div className="fixed top-4 right-4">
            <div className="mx-auto flex justify-center items-center gap-4 p-2 bg-orange-500 rounded-md shadow-lg outline outline-black w-[15vw] h-[15vh]">
                <img className="w-[7vw] h-[7vh] outline outline-black rounded-full" src={toggleMusicImageSrc} onClick={onMusicClick}></img>
                <img className="w-[7vw] h-[7vh] outline outline-black rounded-full" src={toggleLanguageImageSrc} onClick={onLanguageClick}></img>
            </div>
        </div>
        
    )
}