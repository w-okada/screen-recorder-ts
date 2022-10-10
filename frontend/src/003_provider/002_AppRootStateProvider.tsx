import React, { useContext } from "react";
import { ReactNode } from "react";
import { AudioRootStateAndMethod, useAudioRoot } from "../002_hooks/010_useAudioRoot";

type Props = {
    children: ReactNode;
};

type AppRootStateValue = {
    audioRootState: AudioRootStateAndMethod;
};

const AppRootStateContext = React.createContext<AppRootStateValue | null>(null);
export const useAppRootState = (): AppRootStateValue => {
    const state = useContext(AppRootStateContext);
    if (!state) {
        throw new Error("useAppRootState must be used within AppRootStateProvider");
    }
    return state;
};

export const AppRootStateProvider = ({ children }: Props) => {
    const audioRootState = useAudioRoot();
    const providerValue = {
        audioRootState,
    };

    return <AppRootStateContext.Provider value={providerValue}> {children} </AppRootStateContext.Provider>;
};
