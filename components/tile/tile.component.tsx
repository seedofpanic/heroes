import React from "react";
import {gameStore} from "../../store/game.store";
import {observer} from "mobx-react";
import style from "./tile.component.css";
import {HpLineComponent} from "../hp-line.component";

@observer
export class TileComponent extends React.Component<{coords: string}> {
    render() {
        const {coords} = this.props;
        const tile = gameStore.map[coords];

        if (!tile) {
            return <div className={'tile hidden' + (gameStore.viewTile === coords ? ' selected' : '') + (gameStore.scoutMarks[coords] ? ' scout' : '')} onClick={() => this.viewTile()}><style jsx>{style}</style></div>;
        }

        const mob = tile.mobs.length ? gameStore.mobs[tile.mobs[0]] : null;
        const hero = tile.heroes.length ? gameStore.heroes[tile.heroes[0]] : null;

        return <div style={{backgroundPosition: `${tile.sprite[0]}px ${tile.sprite[1]}px`}} className={'tile exists' + (gameStore.viewTile === coords ? ' selected' : '') +
        (gameStore.killMarks[coords] ? ' kill-mark' : '')} onClick={() => this.viewTile()}>
                {tile.buildingId ? <div className="building"></div> : ''}
                {hero ? <div className="hero">
                    <img src="https://res.cloudinary.com/dstnxq7wt/image/upload/v1580681051/heroes/mobs/knight.png"/>
                    <HpLineComponent current={hero.currentHealth} max={hero.maxHealth}/>
                </div> : ''}
                {mob ? <div className="hero">
                    <div className="monster"></div>
                    <HpLineComponent current={mob.currentHealth} max={mob.maxHealth}/>
                </div> : ''}
            <style jsx>{style}</style>
        </div>
    }

    viewTile() {
        gameStore.showTile(this.props.coords);
    }
}
