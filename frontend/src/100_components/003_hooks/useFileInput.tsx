export type FileInputState = {
    dataURL: string;
    error: boolean;
    message: string;
};
export type FileInputStateAndMethod = FileInputState & {
    // click: () => void;
    click: () => Promise<string>;
};

export const useFileInput = () => {
    const click = async (regex: string) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        const p = new Promise<string>((resolve, reject) => {
            fileInput.onchange = (e) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                console.log("file select", e.target.files[0].type);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (regex != "" && !e.target.files[0].type.match(regex)) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    reject(`not target file type ${e.target.files[0].type}`);
                }
                const reader = new FileReader();
                reader.onload = () => {
                    console.log("load data", reader.result as string);
                    resolve(reader.result as string);
                };
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                reader.readAsDataURL(e.target.files[0]);
            };
            fileInput.click();
        });

        const url = await p;
        return url;
    };
    return { click };
};
