import React from "react";
import {MapComponent} from "../components/map.component";
import {RightPanelComponent} from "../components/right-panel.component";
import _JSXStyle from "styled-jsx/style"

export default function Index() {
    return (
        <div className="frame">
            <MapComponent/>
            <RightPanelComponent/>
            <style jsx>{`
                .frame {
                    display: flex;
                    flex-direction: row;
                }
            `}</style>
        </div>
    );
}