import React from "react";

type LoadingOverlayRCProps = {
    isShow: boolean
};

export const LoadingOverlayRC: React.FC<LoadingOverlayRCProps> = (props) => {
    if(!props.isShow) {
        return null;
    }

    return (

        <div className="fixed inset-0 bg-cyan-800 bg-opacity-100 flex items-center justify-center z-50">
            <img
                src="./assets/wind-toy.svg"
                alt="*"
                className="w-32 h-32 animate-spin"
            />
        </div>

    )
}