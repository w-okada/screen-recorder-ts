import { WindowSize, useWindowStateChangeListener } from "@dannadori/demo-base";
import React, { useContext, useEffect, useState, ReactNode } from "react";
import { loadURLAsDataURL } from "../utils/urlReader";

type Props = {
    children: ReactNode;
};

type AppStateValue = {
    inputSourceType: string | null;
    setInputSourceType: (source: string | null) => void;
    inputSource: string | MediaStream | null;
    setInputSource: (source: MediaStream | string | null) => void;

    windowSize: WindowSize;
};

const AppStateContext = React.createContext<AppStateValue | null>(null);

export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppStateProvider");
    }
    return state;
};

const initialInputSourcePath = "";

export const AppStateProvider = ({ children }: Props) => {
    const [inputSourceType, setInputSourceType] = useState<string | null>("Window");
    const [inputSource, _setInputSource] = useState<MediaStream | string | null>(null);

    const [_updateTime, setUpdateTime] = useState<number>(0);
    const { windowSize } = useWindowStateChangeListener();

    // (1) 初期化
    //// (1-1) Input初期化
    useEffect(() => {
        const loadInitialInputSource = async (path: string) => {
            const data = await loadURLAsDataURL(path);
            setInputSource(data);
        };
        loadInitialInputSource(initialInputSourcePath);
    }, []);

    // (2) update

    //// (2-x) update input source
    const setInputSource = (source: MediaStream | string | null) => {
        if (inputSource instanceof MediaStream) {
            inputSource.getTracks().forEach((x) => {
                x.stop();
            });
        }
        console.log("input source", source);
        _setInputSource(source);
    };

    //// (2-x) notify update
    const updateDetector = () => {
        setUpdateTime(new Date().getTime());
    };

    const providerValue = {
        inputSourceType,
        setInputSourceType,
        inputSource,
        setInputSource,
        updateDetector,

        windowSize,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
