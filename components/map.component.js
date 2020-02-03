import React from "react";
import {gameStore} from "../store/game.store";
import _JSXStyle from "styled-jsx/style"
import {observer} from "mobx-react";
import {TileComponent} from "./tile.component";

@observer
export class MapComponent extends React.Component {
    mapFrameX = new Array(15).fill(true);
    mapFrameY = new Array(15).fill(true);

    render() {
        return <div className="map" tabIndex={1} onKeyDown={(e) => this.keysHandler(e)}>
            {this.mapFrameX.map((noop, y) => <div className='line' key={y}>{this.mapFrameY.map((noop, x) =>
                <TileComponent tile={gameStore.getTile(x + gameStore.offsetX, y + gameStore.offsetY)} key={x}/>
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
                gameStore.offsetX -= 1;
                break;
            case 38:
                gameStore.offsetY -= 1;
                break;
            case 39:
                gameStore.offsetX += 1;
                break;
            case 40:
                gameStore.offsetY += 1;
                break;
        }

        e.preventDefault();
    }
}