import React from "react";
import {MapComponent} from "../components/map.component";
import {RightPanelComponent} from "../components/right-panel.component";
import "styled-jsx/style"
import {HeaderComponent} from "../components/header.component";

export default function Index() {
    return (
        <div>
            <HeaderComponent/>
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
        </div>
    );
}