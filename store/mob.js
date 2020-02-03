import {observable, toJS} from "mobx";
import {gameStore, mapCoords} from "./game.store";
import {random} from "./random";

let nextMobNumber = 1;

export class Mob {
    @observable id = nextMobNumber;
    @observable name = `Mob ${nextMobNumber}`;
    @observable maxHealth;
    @observable currentHealth;
    damageMin = 1;
    damageMax = 3;
    x;
    y;

    constructor() {
        nextMobNumber++;
    }

    generate() {
        this.maxHealth = random(5, 20);
        this.currentHealth = this.maxHealth;
    }

    hit(damage) {
        this.currentHealth -= damage;

        if (this.currentHealth <= 0) {
            this.die();

            return this.generateLoot();
        }
    }

    generateLoot() {
        return [
            {id: 'leather', chance: 0.5},
            {id: 'leather', chance: 0.5},
        ].filter(item => item.chance > Math.random());
    }

    getDamage() {
        return random(this.damageMin, this.damageMax);
    }

    die() {
        const tile = gameStore.map[mapCoords(this.x, this.y)];
        tile.mobs = tile.mobs.filter(mobId => mobId !== this.id);
        delete gameStore.mobs[this.id];
    }
}