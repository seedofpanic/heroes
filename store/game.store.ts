import {observable} from "mobx"
import {Hero} from "./hero";
import {spritesMap, Tile} from "./tile";
import {Building} from "./building";
import {Mob} from "./mob";

class GameStore {
    @observable mapWidth = 15;
    @observable mapHeight = 15;
    @observable offsetX = -5;
    @observable offsetY = -5;
    @observable heroes: {[name: number]: Hero} = {};
    @observable mobs: {[name: number]: Mob} = {};
    @observable buildings: {[name: number]: Building} = {};
    @observable map: {[name: string]: Tile} = {};
    @observable viewTile: string = null;
    @observable viewHiddenTile: string = null;
    @observable heroToShow: Hero = null;
    @observable money = 20;
    @observable scoutMarks: {[name: string]: {reward: number, heroId: number}} = {};
    maxX = 0;
    minX = 0;
    maxY = 0;
    minY = 0;

    showTile(coords: string) {
        this.viewTile = coords;
    }

    addTile(tile, x, y) {
        if (x > this.maxX) {
            this.maxX = x;
        }

        if (x < this.minX) {
            this.minX = x;
        }

        if (y > this.maxY) {
            this.maxY = y;
        }

        if (y < this.minY) {
            this.minY = y;
        }

        const coords = mapCoords(x, y);

        this.map[coords] = tile;

        if (this.scoutMarks[coords]) {
            if (this.scoutMarks[coords].heroId) {
                // TODO: remove navigation
                // this.heroes[this.scoutMarks[coords].heroId];
            }

            delete this.scoutMarks[coords];
        }
    }

    addHero(hero, x, y) {
        this.heroes[hero.id] = hero;
        this.map[mapCoords(x, y)].heroes.push(hero.id);
    }

    getTile(x, y) {
        return this.map[mapCoords(x, y)];
    }

    newMob() {
        const mob = new Mob();

        mob.generate();
        this.mobs[mob.id] = mob;

        return mob;
    }

    tick(count) {
        if (count % 20 === 0) {
            this.money += 1;
        }

        Object.keys(gameStore.heroes).forEach(id => {
            const hero = gameStore.heroes[id];

            if (hero.isDead) {
                return;
            }

            hero.ai();
        });
    }

    genPathArray() {
        const pathArray = [];

        for (let y = this.minY; y <= this.maxY; y++) {
            const line = [];

            pathArray.push(line);

            for (let x = this.minX; x <= this.maxX; x++) {
                const tile = this.getTile(x, y);
                line.push(!tile || tile.mobs.length ? 1 : 0);
            }
        }

        return pathArray;
    }

    getBuildingFromCoords(x, y) {
        return this.buildings[this.map[mapCoords(x, y)].buildingId];
    }

    build(tile) {
        const building = new Building();

        tile.buildingId = building.id;
        this.buildings[building.id] = building;
    }

    addScoutMark(coords: string) {
        this.scoutMarks[coords] = {reward: 5, heroId: null};
        this.money -= 5;
    }
}

export const gameStore = new GameStore();

export function mapCoords(x, y) {
    return `${x}x${y}`;
}

const tile = new Tile();
tile.sprite = spritesMap.grass;
gameStore.build(tile);
gameStore.addTile(tile, 0, 0);
const hero = new Hero(0, 0);
hero.generate();
gameStore.addHero(hero, 0, 0);

let countTicks = 0;
function doTicks() {
    setTimeout(() => {
        gameStore.tick(countTicks++);

        if (countTicks > 1000) {
            countTicks = 0;
        }

        doTicks();
    }, 1000);
}

doTicks();

