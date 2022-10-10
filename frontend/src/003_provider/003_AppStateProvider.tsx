import React, { useContext } from "react";
import { ReactNode } from "react";
import { FrontendManagerStateAndMethod, useFrontendManager } from "../002_hooks/100_useFrontendManager";

type Props = {
    children: ReactNode;
};

interface AppStateValue {
    frontendManagerState: FrontendManagerStateAndMethod;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);
export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppStateProvider");
    }
    return state;
};

export const AppStateProvider = ({ children }: Props) => {
    const frontendManagerState = useFrontendManager();
    const providerValue = {
        frontendManagerState
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
