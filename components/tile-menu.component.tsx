import React from "react";
import {gameStore} from "../store/game.store";
import {Tile} from "../store/tile";
import {observer} from "mobx-react";
import Button from "react-bootstrap/Button";

@observer
export class TileMenuComponent extends React.Component<{tile: Tile}> {
    render() {
        const {tile} = this.props;
        const money = gameStore.money;

        return <div>
            {tile.mobs.length ?
                ((money >= 10) ? <Button onClick={() => this.setReward()}>set a reward</Button> : '') :
                tile.buildingId ? '' :
                        <Button onClick={() => this.buildTavern()}>Build Tavern</Button>
            }
        </div>;
    }

    private buildTavern() {
        gameStore.build(this.props.tile)
    }

    private setReward() {
        const {x, y} = this.props.tile;
        gameStore.setKillReward(x, y);
    }
}