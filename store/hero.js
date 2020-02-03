import {observable} from "mobx";
import PF from "pathfinding";
import {gameStore, mapCoords} from "./game.store";
import {Tile} from "./tile";
import {random} from "./random";

let nextHeroNumber = 1;

export class Hero {
    @observable id = nextHeroNumber;
    @observable name = 'Sr. ' + nextHeroNumber;
    @observable maxHealth;
    @observable currentHealth;
    x;
    y;
    damageMin = 1;
    damageMax = 3;
    @observable isDead;
    navigator;
    @observable inventory = {};
    @observable money = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        nextHeroNumber += 1;
    }

    generate() {
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
    }

    ai() {
        const tile = gameStore.map[mapCoords(this.x, this.y)];

        if (this.x === 0 && this.y === 0) {
            this.sellItems();

            if (this.currentHealth < this.maxHealth) {
                this.heal(10);

                return;
            }
        }

        if (this.navigator) {
            this.aiNavigation();
        } else if (tile.mobs.length > 0) {
            this.engage(tile);
        } else {
            this.aiMove();
        }
    }

    sellItems() {
        const {building} = gameStore.map[mapCoords(this.x, this.y)];

        if (this.inventory['leather'] > 0) {
            building.addItems({
                leather: this.inventory['leather']
            });
            this.money = this.inventory['leather'];
            this.inventory['leather'] = 0;

            if (this.inventory['leather'] === 0) {
                delete this.inventory['leather'];
            }
        }
    }

    aiNavigation() {
        const step = this.navigator.path.shift();

        this.move(step[0] + this.navigator.offsets[0], step[1] + this.navigator.offsets[1]);

        if (!this.navigator.path.length) {
            this.navigator = null;
        }
    }

    aiMove() {
        switch (Math.floor(Math.random() * 4)) {
            case 0:
                this.move(this.x + 1, this.y);
                break;
            case 1:
                this.move(this.x - 1, this.y);
                break;
            case 2:
                this.move(this.x, this.y + 1);
                break;
            case 3:
                this.move(this.x, this.y - 1);
                break;
        }
    }

    move(x, y) {
        const from = mapCoords(this.x, this.y);
        const to = mapCoords(x, y);

        gameStore.map[from].heroes = gameStore.map[from].heroes.filter(heroId => heroId !== this.id);

        if (!gameStore.map[to]) {
            const tile = new Tile();

            tile.generate(x, y);

            gameStore.addTile(tile, x, y);
        }

        gameStore.map[to].heroes.push(this.id);

        this.x = x;
        this.y = y;
    }

    getDamage() {
        return random(this.damageMin, this.damageMax);
    }

    engage(tile) {
        const mob = gameStore.mobs[tile.mobs[0]];

        if (!mob) {
            tile.mobs.shift();

            return;
        }

        const loot = mob.hit(this.getDamage());
        this.hit(mob.getDamage());

        if (!this.isDead && loot) {
            this.addItems(loot);
        }
    }

    addItems(loot) {
        loot.forEach(item => {
            this.inventory[item.id] = this.inventory[item.id] ? this.inventory[item.id] + 1 : 1;
        });
    }

    hit(damage) {
        this.currentHealth -= damage;

        if (this.currentHealth <= this.maxHealth / 10) {
            const grid = new PF.Grid(gameStore.genPathArray());
            var finder = new PF.AStarFinder();

            this.navigator = {
                offsets: [gameStore.minX, gameStore.minY],
                path: finder.findPath(this.x - gameStore.minX, this.y - gameStore.minY, 0 - gameStore.minX, 0 - gameStore.minY, grid)
            };
        }

        if (this.currentHealth <= 0) {
            this.die();
        }
    }

    die() {
        gameStore.map[mapCoords(this.x, this.y)].heroes = gameStore.map[mapCoords(this.x, this.y)].heroes.filter(heroId => heroId !== this.id);
        this.isDead = true;
    }

    heal(value) {
        this.currentHealth += value;

        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
    }
}