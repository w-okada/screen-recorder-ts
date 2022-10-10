
export const Resolutions = {
    "small": JSON.stringify([640, 400]),
    "HD": JSON.stringify([1280, 720]),
    "FHD": JSON.stringify([1920, 1080])
} as const
export type Resolutions = typeof Resolutions[keyof typeof Resolutions]



export type ApplicationSetting =
    {
        "app_title": string,
    }


export const fetchApplicationSetting = async (): Promise<ApplicationSetting> => {
    const url = `./assets/setting.json`
    const res = await fetch(url, {
        method: "GET"
    });
    const setting = await res.json() as ApplicationSetting
    return setting;
}
