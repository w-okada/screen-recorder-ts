import React, { useEffect, useMemo } from "react";
import { useStateControlCheckbox } from "../003_hooks/useStateControlCheckbox";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./101_HeaderButton";
import { ScreenRecorderController } from "./310_ScreenRecorderController";
import { MixController } from "./320_MixController";

export const RightSidebar = () => {
    const sidebarAccordionScreenRecorderControllerCheckBox = useStateControlCheckbox("screen-recorder-controller");
    const sidebarAccordionMixControllerCheckBox = useStateControlCheckbox("mix-controller");
    const sidebarAccordionLinksCheckBox = useStateControlCheckbox("links");

    const accodionButtonForScreenRecorderController = useMemo(() => {
        const accodionButtonForScreenRecorderControllerProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionScreenRecorderControllerCheckBox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForScreenRecorderControllerProps}></HeaderButton>;
    }, []);

    const accodionButtonForMixController = useMemo(() => {
        const accodionButtonForMixControllerProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionMixControllerCheckBox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForMixControllerProps}></HeaderButton>;
    }, []);

    const accodionButtonForLinks = useMemo(() => {
        const accodionButtonForLinksProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionLinksCheckBox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForLinksProps}></HeaderButton>;
    }, []);


    useEffect(() => {
        sidebarAccordionScreenRecorderControllerCheckBox.updateState(true);
        sidebarAccordionMixControllerCheckBox.updateState(true);
    }, []);
    return (
        <>
            <div className="right-sidebar">
                {sidebarAccordionScreenRecorderControllerCheckBox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title">Screen Recorder</div>
                        <div className="sidebar-header-caret"> {accodionButtonForScreenRecorderController}</div>
                    </div>
                    <ScreenRecorderController></ScreenRecorderController>
                </div>

                {sidebarAccordionMixControllerCheckBox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title">Mix Controll</div>
                        <div className="sidebar-header-caret"> {accodionButtonForMixController}</div>
                    </div>
                    <MixController></MixController>
                </div>

                {sidebarAccordionLinksCheckBox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title">Links</div>
                        <div className="sidebar-header-caret"> {accodionButtonForLinks}</div>
                    </div>
                    <MixController></MixController>
                </div>

            </div>
        </>
    );
};
