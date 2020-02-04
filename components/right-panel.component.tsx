import React from "react";
import {observer} from "mobx-react";
import {gameStore} from "../store/game.store";
import {HeroDetailsComponent} from "./hero-details.component";
import {BuildingInfoComponent} from "./building-info.component";
import {BuildMenuComponent} from "./build-menu.component";
import {HiddenTileDetailComponent} from "./hidden-tile-detail.component";

@observer
export class RightPanelComponent extends React.Component {
    render() {
        if (!gameStore.viewTile) {
            return <div className="right-panel"></div>;
        }

        const tile = gameStore.map[gameStore.viewTile];

        if (!tile) {
            return <div className="right-panel">
                <HiddenTileDetailComponent coords={gameStore.viewTile}/>
            </div>;
        }

        const building = tile.buildingId ? gameStore.buildings[tile.buildingId] : null;

        return <div className="right-panel">
            {gameStore.heroToShow ?
                <div className="part">
                    <HeroDetailsComponent hero={gameStore.heroToShow}/>
                </div>
                : ''
            }
            <div className="part">
                {
                    building ? <BuildingInfoComponent building={building}/> : <BuildMenuComponent tile={tile}></BuildMenuComponent>
                }
                {tile.heroes.length ?
                <div>
                    <div>Heroes</div>
                    <ul>
                        {tile.heroes.map((heroId) => {
                            const hero = gameStore.heroes[heroId];
                            return <li key={heroId} onClick={() => this.showHero(hero)}>{hero.name} ({hero.currentHealth}/{hero.maxHealth})</li>
                        })}
                    </ul>
                </div> : ''
                }
                {tile.mobs.length ?
                <div>
                    <div>Mobs</div>
                    <ul>
                        {tile.mobs.map((mobId) => {
                            const mob = gameStore.mobs[mobId];
                            return <li key={mobId}>{mob.name} ({mob.currentHealth}/{mob.maxHealth})</li>
                        })}
                    </ul>
                </div> : ''
                }
            </div>
            <style jsx>{`
                .right-panel {
                    display: flex;
                    flex-direction: row;
                    flex: 1;
                }
                .part {
                    flex: 1;
                }
            `}
            </style>
        </div>;
    }

    showHero(hero) {
        gameStore.heroToShow = hero;
    }
}