export type TopLeftButtonRCProps = {
    onClick: () => void,
    iconSrc: string,
    alt: string 
}

export const TopLeftButtonRC: React.FC<TopLeftButtonRCProps> = (props) => {

    return (
         <button
      onClick={props.onClick}
      className="
        fixed top-4 left-14
        z-50
        w-10 h-10
        p-1
        bg-white bg-opacity-80
        rounded-full
        shadow-md
        hover:bg-opacity-100
        transition
        flex items-center justify-center
      "
    >
      <img src={props.iconSrc} alt={props.alt} className="w-full h-full object-contain" />
    </button>
    )
};