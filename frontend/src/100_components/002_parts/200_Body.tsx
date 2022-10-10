import React, { useMemo } from "react";
// import { RECORDING_CANVAS_ID } from "../../const";
import { TARGET_SCREEN_VIDEO_ID } from "../../const";
// import { useAppSetting } from "../../003_provider/001_AppSettingProvider";
// import { useAppState } from "../../003_provider/003_AppStateProvider";

export const Body = () => {
    // const mainCanvas = useMemo(() => {
    //     return <canvas className="body-main-canvas" id={RECORDING_CANVAS_ID}></canvas>
    // }, [])

    const mainVideo = useMemo(() => {
        return <video className="body-main-video" id={TARGET_SCREEN_VIDEO_ID} muted></video>
    }, [])

    return (
        <div className="body-content">
            {/* {mainCanvas} */}
            {mainVideo}
        </div>
    );
};
