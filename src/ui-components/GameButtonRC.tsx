
type GameButtonRCProps = {
    iconName: string,
    onClick: () => void,
}

export const GameButtonRC: React.FC<GameButtonRCProps> = (props) => {
    const iconPath = "./icons/" + props.iconName + ".png";
    return (
        <img src={iconPath} alt="" onClick={props.onClick} className="cursor-pointer rounded-full  min-w-[60px] min-h-[60px] w-[15vw] h-[15vw] max-w-[300px] max-h-[300px] transition-transform duration-200 hover:scale-105 border-8 border-indigo-100" /> 
    )
}

export const HighlightGameButtonRC: React.FC<GameButtonRCProps> = (props) => {
    const iconPath = "./icons/" + props.iconName + ".png";
    return (
        <img src={iconPath} alt="" onClick={props.onClick} className="mx-2 cursor-pointer rounded-full  min-w-[80px] min-h-[80px] w-[17vw] h-[17vw] max-w-[350px] max-h-[350px] transition-transform duration-200 hover:scale-105 border-8 border-sky-300 border-spacing-5 shadow-lg" /> 
    )
}