import { useMemo } from "react"

export type AudioRootState = {
    audioContext: AudioContext
}
export type AudioRootStateAndMethod = AudioRootState & {
    dummy: () => void
}

export const useAudioRoot = (): AudioRootStateAndMethod => {
    const audioContext = useMemo(() => {
        const ctx = new AudioContext()
        return ctx
    }, [])


    return {
        audioContext,
        dummy: () => { }
    }
}
