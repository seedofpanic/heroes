import {computed, observable} from "mobx";
import PF from "pathfinding";
import {gameStore, mapCoords} from "./game.store";
import {Tile} from "./tile";
import {random} from "./random";
import {EQUIP_SLOTS, Item, items, ITEMS_TYPES} from "./items";
import {LootItem} from "./mob";

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
    @observable equip: {[name: string]: ITEMS_TYPES} = {
        [EQUIP_SLOTS.CHEST]: null
    };

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
            const building = gameStore.getBuildingFromCoords(this.x, this.y);
            this.sellItems(building);
            this.buyItems(building);

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

    sellItems(building) {
        Object.keys(this.inventory).forEach(itemType => {
            const price = building.toBuy[itemType];

            if (price) {
                let toSell = this.inventory[itemType];

                if (toSell * price > gameStore.money) {
                    toSell = Math.floor(gameStore.money / price);
                }

                building.addItems({
                    [itemType]: toSell
                });
                gameStore.money -= toSell * price;
                this.money += toSell * price;
                this.removeItem(itemType, toSell);
            }
        });
    }

    removeItem(type, count) {
        this.inventory[type] -= count;

        if (this.inventory[type] < 1) {
            delete this.inventory[type];
        }
    }

    buyItems(building) {
        Object.keys(building.inventory).forEach((itemType: ITEMS_TYPES) => {
            const count = building.inventory[itemType];
            const price = building.forSell[itemType];

            if (price) {
                if (!this.inventory[itemType] && price <= this.money) {
                    this.addItem(itemType, 1);
                    this.equipItem(itemType);
                    building.removeItem(itemType, 1);
                    this.money -= price;
                    gameStore.money += price;
                }
            }
        });
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

    engage(tile: Tile) {
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

    addItems(loot: LootItem[]) {
        loot.forEach(lootItem => {
            this.addItem(lootItem.type, 1);
        });
    }

    addItem(type, count) {
        this.inventory[type] = this.inventory[type] ? this.inventory[type] + count : count;
    }

    equipItem(item: ITEMS_TYPES) {
        if (!items[item].equippable) {
            return;
        }

        this.equip[items[item].equippable] = item;
    }

    hit(damage: number) {
        const finalDamage = damage / this.armor;
        this.currentHealth -= finalDamage < 1 ? 1 : Math.floor(finalDamage);

        if (this.currentHealth <= this.maxHealth / 10) {
            const grid = new PF.Grid(gameStore.genPathArray());
            const finder = new PF.AStarFinder();

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

    @computed get armor() {
        const chest = this.equip[EQUIP_SLOTS.CHEST];

        return 1 + (chest ? items[chest].stats.armor : 0);
    }
}