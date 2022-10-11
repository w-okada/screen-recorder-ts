import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppSettingProvider, useAppSetting } from "./003_provider/001_AppSettingProvider";
import { AppRootStateProvider } from "./003_provider/002_AppRootStateProvider";
import "./100_components/001_css/001_App.css";
import { AppStateProvider } from "./003_provider/003_AppStateProvider";
import App from "./App";

const AppStateProviderWrapper = () => {
    return (
        <AppStateProvider>
            <App />
        </AppStateProvider>
    );
};

// アプリの説明
const FrontPageDescriptionJp = () => {
    return (
        <div className="front-description">
            <p>
                ブラウザを使った画面録画アプリケーションです。
                ブラウザ単体で動くため、専用のアプリケーションのインストールは不要です。また、サーバとの通信も発生しないため通信負荷を気にする必要がありません。
            </p>
            <p>
                ソースコード、使用方法は
                <a href="https://github.com/w-okada/screen-recorder-ts">こちら。</a>
            </p>
            <p className="front-description-strong">使ってみてコーヒーくらいならごちそうしてもいいかなという人はこちらからご支援お願いします。 </p>
            <p>
                <a href="https://www.buymeacoffee.com/wokad">
                    <img className="front-description-img" src="./assets/img/coffee.png"></img>
                </a>
            </p>
        </div>
    );
};

const FrontPageDescriptionEn = () => {
    return (
        <div className="front-description">
            <p>
                Record your screen with your browser!
            </p>
            <p>
                This application run on web browser and there is no need to install a dedicated application.  Also, since no communication with the server occurs after loaded, there is no need to worry about communication load.
            </p>

            <p>
                Usage and source code is in <a href="https://github.com/w-okada/screen-recorder-ts">the repository</a>
            </p>
            <p className="front-description-strong">please support me! </p>
            <p>
                <a href="https://www.buymeacoffee.com/wokad">
                    <img className="front-description-img" src="./assets/img/coffee.png"></img>
                </a>
            </p>
        </div>
    );
};

// 免責
const FrontPageDisclaimerJp = () => {
    return (
        <div className="front-disclaimer">免責：本ソフトウェアの使用または使用不能により生じたいかなる直接損害・間接損害・波及的損害・結果的損害 または特別損害についても、一切責任を負いません。</div>
    );
};
const FrontPageDisclaimerEn = () => {
    return (
        <div className="front-disclaimer">Disclaimer: In no event will we be liable for any direct, indirect, consequential, incidental, or special damages resulting from the use or inability to use this software.</div>
    );
};

// Note
const FrontPageNoteJp = () => {
    return (
        <div className="front-description">
            <p>このアプリケーションは <a href="https://github.com/ffmpegwasm/ffmpeg.wasm">ffmpeg.wasm</a>を使用しています</p>
        </div>
    );
};
const FrontPageNoteEn = () => {
    return (
        <p>This software uses <a href="https://github.com/ffmpegwasm/ffmpeg.wasm">ffmpeg.wasm</a></p>
    );
};


const AppRootStateProviderWrapper = () => {
    const { applicationSettingState, deviceManagerState } = useAppSetting();
    const [firstTach, setFirstTouch] = React.useState<boolean>(false);
    const lang = window.navigator.language.toLocaleUpperCase();
    const description = lang.includes("JA") ? <FrontPageDescriptionJp /> : <FrontPageDescriptionEn />
    const disclaimer = lang.includes("JA") ? <FrontPageDisclaimerJp /> : <FrontPageDisclaimerEn />
    const note = lang.includes("JA") ? <FrontPageNoteJp /> : <FrontPageNoteEn />

    if (!applicationSettingState.applicationSetting || !firstTach) {

        return (
            <div className="front-container">
                <div className="front-title">Screen Recorder</div>

                {description}

                <div
                    className="front-start-button"
                    onClick={() => {
                        setFirstTouch(true);
                    }}
                >
                    Click to start
                </div>
                <div className="front-note">Tested: Windows 11 + Chrome</div>

                {disclaimer}

                {note}

            </div>
        );
    } else if (deviceManagerState.audioInputDevices.length === 0) {
        return (
            <>
                <div className="start-button">Loading Devices...</div>
            </>
        );
    } else {
        return (
            <AppRootStateProvider>
                <AppStateProviderWrapper></AppStateProviderWrapper>
            </AppRootStateProvider>
        );
    }
};

const container = document.getElementById("app")!;
const root = createRoot(container);
root.render(
    <AppSettingProvider>
        <AppRootStateProviderWrapper></AppRootStateProviderWrapper>
    </AppSettingProvider>
);