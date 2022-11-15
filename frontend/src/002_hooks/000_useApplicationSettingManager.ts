import { useEffect, useState } from "react"
import { ApplicationSetting, fetchApplicationSetting } from "../001_clients_and_managers/000_ApplicationSettingLoader"

export type ApplicationSettingManagerStateAndMethod = {
    applicationSetting: ApplicationSetting | null
}
const LOCAL_STORAGE_PREFIX = location.pathname
const LOCAL_STORAGE_APPLICATION_SETTING = `${LOCAL_STORAGE_PREFIX}_applicationSetting`

export const useApplicationSettingManager = (): ApplicationSettingManagerStateAndMethod => {
    const [applicationSetting, setApplicationSetting] = useState<ApplicationSetting | null>(null)

    /** (1) Initialize Setting */
    /** (1-1) Load from localstorage */
    const loadApplicationSetting = async () => {
        if (localStorage[LOCAL_STORAGE_APPLICATION_SETTING]) {
            const applicationSetting = JSON.parse(localStorage[LOCAL_STORAGE_APPLICATION_SETTING]) as ApplicationSetting
            console.log("Load AppStteing from Local Storage", applicationSetting)
            setApplicationSetting({ ...applicationSetting })
        } else {
            const applicationSetting = await fetchApplicationSetting()
            console.log("Load AppStteing from Server", applicationSetting)
            setApplicationSetting({ ...applicationSetting })
        }
    }
    useEffect(() => {
        loadApplicationSetting()
    }, [])

    return {
        applicationSetting,
    }
}
