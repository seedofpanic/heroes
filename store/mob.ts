import {observable, toJS} from "mobx";
import {gameStore, mapCoords} from "./game.store";
import {random} from "./random";
import {ITEMS_IDS} from "./items";

let nextMobNumber = 1;

export interface LootItem {
    type: ITEMS_IDS;
    chance: number;
}

export class Mob {
    @observable id = nextMobNumber;
    @observable name = `Mob ${nextMobNumber}`;
    @observable maxHealth: number;
    @observable currentHealth: number;
    isDead: boolean;
    damageMin = 1;
    damageMax = 3;
    x: number;
    y: number;
    possibleLoot: LootItem[] = [
        {type: ITEMS_IDS.LEATHER, chance: 0.5},
        {type: ITEMS_IDS.LEATHER, chance: 0.5},
    ];

    constructor() {
        nextMobNumber++;
    }

    generate() {
        this.maxHealth = random(5, 20);
        this.currentHealth = this.maxHealth;
    }

    hit(damage): LootItem[] | null {
        this.currentHealth -= damage;

        if (this.currentHealth <= 0) {
            this.die();

            return this.generateLoot();
        }
    }

    generateLoot(): LootItem[] {
        return this.possibleLoot.filter(item => item.chance > Math.random());
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