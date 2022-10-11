// Ver: 2022/10/10

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
                // @ts-ignore
                console.log("file select", e.target.files[0].type);
                // @ts-ignore
                const type = e.target.files[0].type
                const reader = new FileReader();
                reader.onload = () => {
                    // @ts-ignore
                    if (regex != "" && !type.match(regex)) {
                        //@ts-ignore
                        reject(`not target file type ${type}`);
                    }
                    console.log("load data", reader.result as string);
                    resolve(reader.result as string);
                };
                // @ts-ignore
                reader.readAsDataURL(e.target.files[0]);
            };
            fileInput.click();
        });

        try {
            const url = await p;
            return url;
        } catch (exception) {
            throw exception
        }
    };
    return { click };
};
