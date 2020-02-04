import React from "react";
import {MapComponent} from "../components/map.component";
import {RightPanelComponent} from "../components/right-panel.component";
import "styled-jsx/style"
import {HeaderComponent} from "../components/header.component";
const style = require('!!raw-loader!bootstrap/dist/css/bootstrap.css');

export default class extends React.Component {
    componentDidMount() {
        const head = document.getElementsByTagName('head')[0];
        const styleElement = window.document.createElement('style');

        styleElement.innerHTML = style.default;
        head.appendChild(styleElement);
    }

    render() {
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
}