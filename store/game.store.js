import {observable} from "mobx"
import {Hero} from "./hero";
import {spritesMap, Tile} from "./tile";
import {Building} from "./building";
import {Mob} from "./mob";

export const gameStore = new class GameStore {
    @observable offsetX = -5;
    @observable offsetY = -5;
    @observable heroes = {};
    @observable mobs = {};
    @observable map = {};
    @observable viewTile = null;
    @observable heroToShow = null;
    maxX = 0;
    minX = 0;
    maxY = 0;
    minY = 0;

    showTile(tile) {
        this.viewTile = tile;
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

        this.map[mapCoords(x, y)] = tile;
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

    tick() {
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
};

export function mapCoords(x, y) {
    return `${x}x${y}`;
}

const tile = new Tile();
tile.sprite = spritesMap.grass;
tile.building = new Building();
gameStore.addTile(tile, 0, 0);
const hero = new Hero(0, 0);
hero.generate();
gameStore.addHero(hero, 0, 0);

function doTicks() {
    setTimeout(() => {
        gameStore.tick();

        doTicks();
    }, 1000);
}

doTicks();

