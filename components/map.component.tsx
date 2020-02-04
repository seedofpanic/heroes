import React from "react";
import {gameStore, mapCoords} from "../store/game.store";
import {observer} from "mobx-react";
import {TileComponent} from "./tile/tile.component";

@observer
export class MapComponent extends React.Component {
    mapFrameX = new Array(gameStore.mapWidth).fill(true);
    mapFrameY = new Array(gameStore.mapHeight).fill(true);

    render() {
        return <div className="map" tabIndex={1} onKeyDown={(e) => this.keysHandler(e)}>
            {this.mapFrameX.map((noop, y) => <div className='line' key={y}>{this.mapFrameY.map((noop, x) =>
                <TileComponent coords={mapCoords(x + gameStore.offsetX, y + gameStore.offsetY)} key={x}/>
            )}</div>)}
            <style jsx>{`
                .map {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
                .line {
                    flex: 1;
                    display: flex;
                    flex-direction: row;
                }
            `}
            </style>
        </div>;
    }

    keysHandler(e) {
        switch (e.keyCode) {
            case 37:
                if (gameStore.minX - 10 < gameStore.offsetX) {
                    gameStore.offsetX -= 1;
                }
                break;
            case 38:
                if (gameStore.minY - 10 < gameStore.offsetY) {
                    gameStore.offsetY -= 1;
                }
                break;
            case 39:
                if (gameStore.maxX + 10 - gameStore.mapWidth >= gameStore.offsetX) {
                    gameStore.offsetX += 1;
                }
                break;
            case 40:
                if (gameStore.maxY + 10 - gameStore.mapHeight >= gameStore.offsetY) {
                    gameStore.offsetY += 1;
                }
                break;
        }

        e.preventDefault();
    }
}