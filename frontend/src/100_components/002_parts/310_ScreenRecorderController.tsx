import React, { useMemo } from "react";
import { useAppState } from "../../003_provider/003_AppStateProvider";
// import { TARGET_SCREEN_VIDEO_ID } from "../../const";

export const ScreenRecorderController = () => {
    const { frontendManagerState } = useAppState()

    const chooseWindowRow = useMemo(() => {
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
            <div className="sidebar-content-row-7-3">
                <div className="sidebar-content-row-label">Choose Window:</div>
                <div className="sidebar-content-row-buttons">
                    <div className="sidebar-content-row-button" onClick={() => onChooseWindowClicked()}>click</div>
                </div>
            </div>
        )
    }, [])

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
                statusMessage = `(recording... ${frontendManagerState.chunkNum})`;
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

    }, [frontendManagerState.recordingStatus, frontendManagerState.chunkNum, frontendManagerState.convertProgress])

    const chunkDurationRow = useMemo(() => {
        const onChunkDurationChange = (val: number) => {
            frontendManagerState.setChunkDuration(val)
        }
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">process interval</div>
                <div className="sidebar-content-row-input">
                    <input type="number" min="1" max="5" step="1" value={frontendManagerState.chunkDuration} onChange={(e) => { onChunkDurationChange(Number(e.target.value)) }}></input>
                </div>
            </div>
        )
    }, [frontendManagerState.chunkDuration])
    const waitToProcessRow = useMemo(() => {
        const onWaitToDownloadChange = (val: number) => {
            frontendManagerState.setWaitTimeToProcess(val)
        }
        return (
            <div className="sidebar-content-row-5-5">
                <div className="sidebar-content-row-label">wait for last data</div>
                <div className="sidebar-content-row-input">
                    <input type="number" min="1" max="5" step="1" value={frontendManagerState.waitTimeToProcess} onChange={(e) => { onWaitToDownloadChange(Number(e.target.value)) }}></input>
                </div>
            </div>
        )
    }, [frontendManagerState.waitTimeToProcess])

    return (
        <div className="sidebar-content">
            {chooseWindowRow}
            {/* {targetScreenViewRow} */}
            {startRecordingButtonRow}
            {chunkDurationRow}
            {waitToProcessRow}
        </div>
    );
};
