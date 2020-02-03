import {observable} from "mobx";
import {gameStore} from "./game.store";
import {random} from "./random";

// sprite size 48
export const spritesMap = {
    grass: [0, 0],
    grass2: [-48, 0],
    grass3: [0, -48],
    grass4: [-48, -48],
    grass5: [0, -96],
    grass6: [-48, -96],
    grass_gravel_inside: [-96, 0]
};

const grassFull = [
    spritesMap.grass,
    spritesMap.grass2,
    spritesMap.grass3,
    spritesMap.grass4,
    spritesMap.grass5,
    spritesMap.grass6,
    spritesMap.grass_gravel_inside
];

export class Tile {
    @observable heroes = [];
    @observable mobs = [];
    sprite;
    @observable building;

    constructor() {
    }

    generate(x, y) {
        const mob = gameStore.newMob();

        mob.x = x;
        mob.y = y;

        this.mobs.push(mob.id);

        this.sprite = grassFull[random(0, grassFull.length - 1)];
    }
}