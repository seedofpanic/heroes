import React from "react";
import {gameStore} from "../store/game.store";
import {Tile} from "../store/tile";
import {observer} from "mobx-react";

@observer
export class BuildMenuComponent extends React.Component {
    props: {tile: Tile};

    render() {
        if (this.props.tile.mobs.length > 0) {
            return '';
        }

        return <div>
            <button onClick={() => this.buildTavern()}>Build Tavern</button>
        </div>;
    }

    buildTavern() {
        gameStore.build(this.props.tile)
    }
}