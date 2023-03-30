import React, { useMemo } from "react";
import { useAppState } from "../../003_provider/003_AppStateProvider";
// import { TARGET_SCREEN_VIDEO_ID } from "../../const";

export const ScreenRecorderController = () => {
    const { frontendManagerState } = useAppState()

    const chooseWindowRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-7-3">
                <div className="sidebar-content-row-label">Choose Window:</div>
                <div className="sidebar-content-row-buttons">
                    <div className="sidebar-content-row-button" onClick={() => onChooseWindowClicked()}>click</div>
                </div>
            </div>
        )
    }, [])

    // const targetScreenViewRow = useMemo(() => {
    //     return (
    //         <div className="sidebar-content-row-5-5">
    //             <div className="sidebar-content-item">
    //                 <video className="sidebar-content-item-video" id={TARGET_SCREEN_VIDEO_ID} muted></video>
    //             </div>
    //             <div className="sidebar-content-item">

    //             </div>
    //         </div>
    //     )
    // }, [])

    const startRecordingButtonRow = useMemo(() => {
        let statusMessage = ""
        let buttonMessage = ""
        let buttonClass = ""
        let buttonAction: () => void = () => { }
        switch (frontendManagerState.recordingStatus) {
            case "initializing":
                statusMessage = "(initializing...)";
                buttonMessage = "wait"
                buttonClass = "sidebar-content-row-button"
                buttonAction = () => { }
                break
            case "stop":
                statusMessage = "(stopped)";
                buttonMessage = "start"
                buttonClass = "sidebar-content-row-button"
                buttonAction = () => { frontendManagerState.startRecording() }
                break
            case "recording":
                statusMessage = `(recording...${Math.floor(frontendManagerState.chunkSize / 10)})`;
                buttonMessage = "stop"
                buttonClass = "sidebar-content-row-button-activated"
                buttonAction = () => { frontendManagerState.stopRecording() }
                break
            case "converting":
                statusMessage = `(converting...${frontendManagerState.convertProgress})`;
                buttonMessage = "wait"
                buttonClass = "sidebar-content-row-button-activated"
                buttonAction = () => { console.log("wait") }
                break
        }

        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-item">
                    <div className={buttonClass} onClick={() => buttonAction()}>{buttonMessage}</div>
                </div>
                <div className="sidebar-content-item">
                    {statusMessage}
                </div>
            </div>
        )

    }, [frontendManagerState.recordingStatus, frontendManagerState.chunkSize, frontendManagerState.convertProgress])

    const onChooseWindowClicked = async () => {
        // @ts-ignore
        const constraints: DisplayMediaStreamConstraints = {
            audio: true,
            video: {
                width: { ideal: 3840 },
                height: { ideal: 2160 },
                frameRate: 15
            }
        }
        const ms = await navigator.mediaDevices.getDisplayMedia(constraints);
        frontendManagerState.setScreenMediaStream(ms)
    }
    return (
        <div className="sidebar-content">
            {chooseWindowRow}
            {/* {targetScreenViewRow} */}
            {startRecordingButtonRow}



        </div>
    );
};
