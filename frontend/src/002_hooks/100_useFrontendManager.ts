import { useEffect, useMemo, useRef, useState } from "react";
import { StateControlCheckbox, useStateControlCheckbox } from "../100_components/003_hooks/useStateControlCheckbox";
import { TARGET_SCREEN_VIDEO_ID } from "../const";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useAudioRoot } from "./010_useAudioRoot";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";

export const RECORDING_STATUS = {
    initializing: "initializing",
    stop: "stop",
    recording: "recording",
    converting: "converting",
} as const
export type RECORDING_STATUS = typeof RECORDING_STATUS[keyof typeof RECORDING_STATUS]

export type StateControls = {
    openRightSidebarCheckbox: StateControlCheckbox
}

type FrontendManagerState = {
    stateControls: StateControls
    screenMediaStream: MediaStream
    recordingStatus: RECORDING_STATUS
    convertProgress: number
    chunkSize: number

    useMicrophone: boolean
    systemAudioGain: number
    microphoneGain: number
};

export type FrontendManagerStateAndMethod = FrontendManagerState & {
    setScreenMediaStream: (ms: MediaStream) => void
    startRecording: () => void
    stopRecording: () => Promise<void>
    setUseMicrophone: (val: boolean) => void
    setSystemAudioGain: (val: number) => void
    setMicrophoneGain: (val: number) => void
}

export const useFrontendManager = (): FrontendManagerStateAndMethod => {
    const { audioContext } = useAudioRoot()
    const { deviceManagerState } = useAppSetting()
    const systemAudioGainNode = useMemo(() => {
        return audioContext.createGain()
    }, [])
    const microphoneGainNode = useMemo(() => {
        return audioContext.createGain()
    }, [])

    const audioDestNode = useMemo(() => {
        const dest = audioContext.createMediaStreamDestination()
        systemAudioGainNode.connect(dest)
        microphoneGainNode.connect(dest)
        return dest
    }, [])

    const [screenMediaStream, _setScreenMediaStream] = useState<MediaStream>(new MediaStream())
    const [recordingStatus, setRecordingStatus] = useState<RECORDING_STATUS>("initializing")
    const [ffmpeg, setFfmpeg] = useState<FFmpeg>();
    const [convertProgress, setConvertProgress] = useState(0);
    const recorderRef = useRef<MediaRecorder | null>(null)
    const chunks = useMemo(() => {
        return [] as Blob[];
    }, []);
    const [chunkSize, setChuhkSize] = useState<number>(0)

    const [useMicrophone, _setUseMicrophone] = useState<boolean>(false)

    const [systemAudioGain, _setSystemAudioGain] = useState<number>(1)
    const [microphoneGain, _setMicrophoneGain] = useState<number>(1)

    const sysSrcNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const micSrcNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)


    // const requestIdRef = useRef(0)

    // (1) Controller Switch
    const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox");

    // (2) initialize
    useEffect(() => {
        const ffmpeg = createFFmpeg({
            log: true,
            // corePath: "./assets/ffmpeg/ffmpeg-core.js",
        });
        const loadFfmpeg = async () => {
            await ffmpeg!.load();

            ffmpeg!.setProgress(({ ratio }) => {
                console.log("progress:", ratio);
                setConvertProgress(ratio);
            });
            setFfmpeg(ffmpeg);
            setRecordingStatus("stop")
        };
        loadFfmpeg();
    }, []);



    // (3) operation
    //// (3-1) set ms
    const setScreenMediaStream = (ms: MediaStream) => {
        const videoElem = document.getElementById(TARGET_SCREEN_VIDEO_ID) as HTMLVideoElement
        // const canvasElem = document.getElementById(RECORDING_CANVAS_ID) as HTMLCanvasElement
        videoElem.onloadedmetadata = () => {
            _setScreenMediaStream(ms)
        }
        videoElem.srcObject = ms
        videoElem.play()

    }

    //// (3-2) start 
    const startRecording = () => {
        setRecordingStatus("recording")
        // (1) ソース取得
        const videoElem = document.getElementById(TARGET_SCREEN_VIDEO_ID) as HTMLVideoElement
        // const canvasElem = document.getElementById(RECORDING_CANVAS_ID) as HTMLCanvasElement
        // @ts-ignore
        const videoMS = videoElem.captureStream() as MediaStream
        // const canvasMS = canvasElem.captureStream() as MediaStream


        // (2) MediaStream作成
        const ms = new MediaStream()
        //// (2-1) video
        // canvasMS.getVideoTracks().forEach(x => { ms.addTrack(x) })
        videoMS.getVideoTracks().forEach(x => { ms.addTrack(x) })

        ///// (2-2) audio. 最終ノードからtrack取得
        audioDestNode.stream.getAudioTracks().forEach(x => { ms.addTrack(x) })

        const options = {
            mimeType: "video/webm;codecs=h264,opus",
        };
        const recorder = new MediaRecorder(ms, options);
        recorder.ondataavailable = (e: BlobEvent) => {
            chunks.push(e.data);

            setChuhkSize(chunks.length)
        };
        try {
            recorder.start(100)
        } catch (exception) {
            console.log(exception)
            alert(exception)
            setRecordingStatus("stop")
        }
        recorderRef.current = recorder
    }

    //// (3-3) stop
    const stopRecording = async () => {
        if (!recorderRef.current) {
            return
        }
        setRecordingStatus("converting")

        recorderRef.current.stop();
        if (chunks.length > 0) {
            await toMp4(chunks);
        } else {
            alert("not enough data");
        }
        while (chunks.length !== 0) {
            chunks.shift();
        }

        setRecordingStatus("stop")
    }

    //// (3-3-a) convert
    const toMp4 = async (blobs: Blob[]) => {
        if (!ffmpeg || ffmpeg.isLoaded() === false) {
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

    // マイク有効/無効変更
    const setUseMicrophone = (val: boolean) => {
        _setUseMicrophone(val)
    }

    // 音量調整 (システム)
    const setSystemAudioGain = (val: number) => {
        // systemAudioGainRef.current = val
        _setSystemAudioGain(val)
        systemAudioGainNode.gain.value = val
    }

    // 音量調整 (マイク)
    const setMicrophoneGain = (val: number) => {
        // microphoneGainRef.current = val
        _setMicrophoneGain(val)
        microphoneGainNode.gain.value = val
    }


    // SystemAudioの変更
    useEffect(() => {
        // (1) 既存の接続を切る
        if (sysSrcNodeRef.current) {
            sysSrcNodeRef.current.disconnect(microphoneGainNode)
            sysSrcNodeRef.current = null
        }

        const videoElem = document.getElementById(TARGET_SCREEN_VIDEO_ID) as HTMLVideoElement
        // @ts-ignore
        const videoMS = videoElem.captureStream() as MediaStream
        // (2) 途中終了
        if (videoMS.getAudioTracks().length == 0) {
            return
        }
        const systemAudioSrc = audioContext.createMediaStreamSource(videoMS)
        systemAudioSrc.connect(systemAudioGainNode)
        sysSrcNodeRef.current = systemAudioSrc

    }, [screenMediaStream])

    // マイク接続の変更。(a) デバイス再指定、 (b)有効/無効変更
    useEffect(() => {
        // (1) 既存の接続を切る
        if (micSrcNodeRef.current) {
            micSrcNodeRef.current.disconnect(microphoneGainNode)
            micSrcNodeRef.current = null
        }

        // (2) 途中終了
        //// (2-1) デバイス指定がない場合
        if (!deviceManagerState.audioInputDeviceId || deviceManagerState.audioInputDeviceId === "none") {
            return
        }
        //// (2-2) Microphone使用しない場合
        if (!useMicrophone) {
            return
        }

        // (3) 新規接続
        const setUserMicrophone = async () => {
            const ms = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: deviceManagerState.audioInputDeviceId!
                }
            })
            const micSrcNode = audioContext.createMediaStreamSource(ms)
            micSrcNode.connect(microphoneGainNode)
            micSrcNodeRef.current = micSrcNode
        }
        setUserMicrophone()
    }, [deviceManagerState.audioInputDeviceId, useMicrophone])


    const returnValue: FrontendManagerStateAndMethod = {
        stateControls: {
            // (1) Controller Switch
            openRightSidebarCheckbox,
        },
        screenMediaStream,
        recordingStatus,
        convertProgress,
        chunkSize,
        useMicrophone,
        systemAudioGain,
        microphoneGain,

        setScreenMediaStream,
        startRecording,
        stopRecording,
        setUseMicrophone,
        setSystemAudioGain,
        setMicrophoneGain,
    };
    return returnValue;
};
