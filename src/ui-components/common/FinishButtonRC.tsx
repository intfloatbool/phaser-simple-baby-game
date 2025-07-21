import { LocProviderInstance } from "../../services/localization/LocProvider"

export type FinishButtonRCProps = {
    locKey: string,
    onClick: () => void
}

export const FinishButtonRC: React.FC<FinishButtonRCProps> = (props) => {
    //const continueText = LocProviderInstance.GetText(props.locKey);

    return (
        <div className="fixed bottom-5">
            <button onClick={props.onClick} type="button" className="text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-lg px-12 py-7 text-center me-4 mb-4">
                <img className="size-12 bg-white" src="./svgs/continue.svg" />
            </button>
        </div>
    )
}