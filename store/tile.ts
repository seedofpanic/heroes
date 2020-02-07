import {observable} from "mobx";
import {gameStore} from "./game.store";
import {random} from "./random";

// sprite size 48
export const spritesMap: {[name: string]: [number, number]} = {
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
    @observable heroes: number[] = [];
    @observable mobs: number[] = [];
    sprite: [number, number];
    @observable buildingId: number;

    constructor(public x: number, public y: number) {
    }

    generate(x, y) {
        const mob = gameStore.newMob(Math.floor(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))));

        mob.x = x;
        mob.y = y;

        this.mobs.push(mob.id);

        this.sprite = grassFull[random(0, grassFull.length - 1)];
    }
}