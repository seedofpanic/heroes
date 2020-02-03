import React from "react";
import {gameStore} from "../store/game.store";
import {observer} from "mobx-react";

@observer
export class HeaderComponent extends React.Component {
    render() {
        return <div>Money: {gameStore.money}</div>
    }
}