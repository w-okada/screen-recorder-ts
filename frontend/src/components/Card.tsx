import "./cardStyle.css";
import React from "react";

export const Card = () => {
    return (
        <div className="m-4 rounded-xl bg-base-100 shadow-lg">
            <div className="m-4">
                <h1 className="text-xl ">Screen Capture with ffmpeg-wasm</h1>
                <h2 className="text-base underline font-black pt-4">Usage</h2>
                <p className="m-1">(1) push choose window button and select windows</p>
                <p className="m-1">(2) push start rec. button. </p>
                <p className="m-1">(3) And then, when you want to stop rec, push the button.</p>

                <h2 className="text-base underline font-black pt-4">Please support me</h2>
                <p className="m-1">You can support coffee here.</p>
                <p>
                    <a href="https://www.buymeacoffee.com/wokad" target="_blank">
                        <img src="coffee.png" alt="Buy Me A Coffee" height="41" width="174" />
                    </a>
                </p>

                <h2 className="text-base underline font-black pt-4">link</h2>
                <h2 className="text-base underline">
                    <a className="text-base userline" href="https://ffmpeg-cli-gen.herokuapp.com/frontend/index.html">
                        SSME: Super simple movie editor with ffmpeg-wasm
                    </a>
                </h2>
                <p className="pl-4">Crop and Trim the movie with a browser. </p>
            </div>
        </div>
    );
};
