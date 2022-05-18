import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Controller } from "./Controller";
import { useAppState } from "./provider/AppStateProvider";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { VideoInputSelector, VideoInputSelectorProps } from "@dannadori/demo-base";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";

const App = () => {
    const { inputSource, windowSize } = useAppState();
    const [ffmpeg, setFfmpeg] = useState<FFmpeg>();
    const [progress, setProgress] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    // (0) initialize
    //// (0-1) chunks
    const chunks = useMemo(() => {
        return [] as Blob[];
    }, []);

    //// (0-2) recorder
    const recorder = useMemo(() => {
        if (inputSource instanceof MediaStream === false) {
            console.log("input source is not media stream");
            return null;
        }
        const options = {
            mimeType: "video/webm;codecs=h264,opus",
        };
        const recorder = new MediaRecorder(inputSource as MediaStream, options);
        recorder.ondataavailable = (e: BlobEvent) => {
            chunks.push(e.data);
        };
        return recorder;
    }, [inputSource]);

    //// (0-3) ffmpeg
    useEffect(() => {
        const ffmpeg = createFFmpeg({
            log: true,
            corePath: "./ffmpeg/ffmpeg-core.js",
        });
        const loadFfmpeg = async () => {
            await ffmpeg!.load();
            ffmpeg!.setProgress(({ ratio }) => {
                console.log("progress:", ratio);
                setProgress(ratio);
            });
            setFfmpeg(ffmpeg);
        };
        loadFfmpeg();
    }, []);

    // (x) change input
    useEffect(() => {
        const video = document.getElementById("input") as HTMLVideoElement;
        video.onloadedmetadata = (_ev) => {
            video.play();
            fitLayout();
        };
        if (typeof inputSource === "string") {
            video.src = inputSource;
        } else if (inputSource instanceof MediaStream) {
            video.srcObject = inputSource;
        } else {
            console.log("unknown source", inputSource);
        }
    }, [inputSource]);

    // (1) Layout
    //// (1-1) Fitting
    useEffect(() => {
        fitLayout();
    }, [windowSize]);

    const fitLayout = () => {};

    // (2) Recording
    //// (2-1) initialize
    ////// No need initialize. recorder is initialized with useMemo
    //// (2-2) start rec
    const startRec = () => {
        if (!recorder || !ffmpeg || ffmpeg.isLoaded() === false) {
            return;
        }
        try {
            console.log("START REC:");
            recorder!.start(1000);
            setIsRecording(true);
        } catch (e) {
            console.log("recording error", e);
        }
    };
    //// (2-3) start rec
    const stopRec = async () => {
        if (!recorder || !ffmpeg || ffmpeg.isLoaded() === false) {
            return;
        }
        try {
            recorder.stop();
        } catch (e) {
            console.log("recording error(stop)", e);
        }
        if (chunks.length > 0) {
            await toMp4(chunks);
        } else {
            alert("not enough data");
        }
        while (chunks.length !== 0) {
            chunks.shift();
        }
        setIsRecording(false);
        console.log("clear recording chunks");
    };

    //// (2-4) convert to mpeg
    const toMp4 = async (blobs: Blob[]) => {
        if (!recorder || !ffmpeg || ffmpeg.isLoaded() === false) {
            return;
        }
        const name = "record.webm";
        const outName = "out.mp4";

        // convert
        // @ts-ignore
        ffmpeg.FS("writeFile", name, await fetchFile(new Blob(blobs)));
        await ffmpeg.run("-i", name, "-c", "copy", outName);
        const data = ffmpeg!.FS("readFile", outName);

        // download
        const a = document.createElement("a");
        a.download = outName;
        a.href = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
        a.click();
    };

    const progressBar = useMemo(() => {
        const level = Math.ceil(progress * 100);
        const style = { "--value": level } as React.CSSProperties;
        return (
            <div className="radial-progress" style={style}>
                {level}%
            </div>
        );
    }, [progress]);

    const { inputSourceType, setInputSourceType, setInputSource } = useAppState();
    const videoInputSelectorProps: VideoInputSelectorProps = {
        id: "video-input-selector",
        currentValue: inputSourceType || "File",
        onInputSourceTypeChanged: setInputSourceType,
        onInputSourceChanged: setInputSource,
    };

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "70%" }}>
                <div id="video-container" style={{ width: "70%", height: "100%", position: "relative" }}>
                    <video id="input" style={{ position: "absolute", objectFit: "contain", maxHeight: "100%" }}></video>
                    <canvas id="overlay" style={{ position: "absolute", objectFit: "contain" }} />
                </div>
                <div id="side-panel" style={{ width: "30%" }}>
                    <Controller></Controller>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "30%" }}>
                <div id="under-panel" style={{ display: "flex", flexDirection: "column", width: "70%", height: "100%" }}>
                    <div id="button-container" style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", width: "100%" }}>
                        <VideoInputSelector {...videoInputSelectorProps}></VideoInputSelector>

                        <div style={{ marginLeft: "5px" }}></div>
                        {isRecording ? (
                            <></>
                        ) : (
                            <button className="btn btn-sm btn-outline" onClick={startRec}>
                                start rec.
                            </button>
                        )}

                        <div style={{ marginLeft: "5px" }}></div>
                        {isRecording ? (
                            <button className="btn btn-sm btn-outline" onClick={stopRec}>
                                stop rec.
                            </button>
                        ) : (
                            <></>
                        )}

                        <div style={{ marginLeft: "15px" }}></div>

                        <div>{progressBar}</div>
                    </div>
                    <div id="message" style={{ margin: "10px", display: "flex", flexDirection: "row", width: "100%" }}>
                        <a className="link text-xl" href="https://ffmpeg-cli-gen.herokuapp.com/frontend/index.html">
                            <span>Next step: crop and trim your movie</span>
                            <span className="ml-2">
                                <FontAwesomeIcon icon={faArrowRightLong} />
                            </span>
                            <span className="ml-2">SSME:Super simple movie editor</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
