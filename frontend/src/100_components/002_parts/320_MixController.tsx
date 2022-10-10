import React, { useMemo } from "react";
import { useAppState } from "../../003_provider/003_AppStateProvider";
import { DeviceSelector } from "./321_DeviceSelector";

export const MixController = () => {
    const { frontendManagerState } = useAppState()

    const useMicRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label">UseMic:</div>
                <div className="sidebar-content-row-checkbox">
                    <input
                        type="checkbox"
                        checked={frontendManagerState.useMicrophone}
                        onChange={(e) => {
                            frontendManagerState.setUseMicrophone(e.target.checked)
                        }}
                    />
                </div>
            </div>
        );
    }, [frontendManagerState.useMicrophone])
    const micSelectorRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label">Mic:</div>
                <div className="sidebar-content-row-select">
                    <DeviceSelector deviceType={"audioinput"}></DeviceSelector>
                </div>
            </div>
        );
    }, []);

    const systemAudioGain = useMemo(() => {
        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label">Audio Gain</div>
                <div className="sidebar-content-row-slider-container">
                    <div className="sidebar-content-row-slider">
                        <input type="range" min="0" max="1" step="0.01" onChange={(e) => {
                            frontendManagerState.setSystemAudioGain(Number(e.target.value))
                        }} />
                    </div>
                    <div className="sidebar-content-row-slider-val">{frontendManagerState.systemAudioGain}</div>

                </div>
            </div>
        );
    }, [frontendManagerState.systemAudioGain]);

    const microphoneAudioGain = useMemo(() => {
        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label">Mic Gain</div>
                <div className="sidebar-content-row-slider-container">
                    <div className="sidebar-content-row-slider">
                        <input type="range" min="0" max="1" step="0.01" onChange={(e) => {
                            frontendManagerState.setMicrophoneGain(Number(e.target.value))
                        }} />
                    </div>
                    <div className="sidebar-content-row-slider-val">{frontendManagerState.microphoneGain}</div>

                </div>
            </div>
        );
    }, [frontendManagerState.microphoneGain]);

    return (
        <div className="sidebar-content">
            {useMicRow}
            {micSelectorRow}
            {systemAudioGain}
            {microphoneAudioGain}
        </div>
    );
};
