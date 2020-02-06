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
    x: number;
    y: number;
    damageMin = 1;
    damageMax = 3;
    @observable isDead;
    navigator = [];
    @observable inventory = {};
    @observable money = 0;
    @observable equip: {[name: string]: ITEMS_TYPES} = {
        [EQUIP_SLOTS.CHEST]: null
    };
    scoutMark: string;

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

        if (tile.mobs.length > 0) {
            this.engage(tile);
            return;
        }

        if (!this.navigator.length && !this.scoutMark) {
            this.checkQuests();
        }

        if (this.navigator.length) {
            this.aiNavigation();
            return;
        }

        this.aiMove();
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
        const navigator = this.navigator[0];

        if (navigator.path.length) {
            const step = navigator.path.shift();

            this.move(step[0] + navigator.offsets[0], step[1] + navigator.offsets[1]);
        }

        if (!navigator.path.length) {
            this.navigator.shift();
        }
    }

    removeScoutMark() {
        this.scoutMark = null;
        this.navigator.length = 0;
    }

    addMoney(amount) {
        this.money += amount;
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
            this.buildTavernNavigator();

            if (this.scoutMark) {
                gameStore.scoutMarks[this.scoutMark].heroId = null;
                this.scoutMark = null;
            }
        }

        if (this.currentHealth <= 0) {
            this.die();
        }
    }

    getNavigationTo(x: number, y: number) {
        const grid = new PF.Grid(gameStore.genPathArray());
        const finder = new PF.AStarFinder();

        return {
            offsets: [gameStore.minX, gameStore.minY],
            path: finder.findPath(this.x - gameStore.minX, this.y - gameStore.minY, x - gameStore.minX, y - gameStore.minY, grid)
        };
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

    private checkQuests() {
        if (Object.keys(gameStore.heroes).length > 1) {
            console.error('multiple heroes not supported!!!')
        }
        const scoutMarks = Object.keys(gameStore.scoutMarks);

        if (scoutMarks.length > 0) {
            this.scoutMark = scoutMarks[0];
            gameStore.scoutMarks[this.scoutMark].heroId = this.id;
            this.buildScoutNavigator();
        }
    }

    private searchForClosest(sourceX: number, sourceY: number, check: (coords: string) => boolean): [number, number] {

        let range = 1;
        const result = [];

        while (result.length === 0) {
            for (let x = sourceX - range; x <= sourceX + range; x++) {
                const upLine = mapCoords(x, sourceY - range);
                if (check(upLine)) {
                    result.push([x, sourceY - range]);
                }

                const bottomLine = mapCoords(x, sourceY + range);
                if (check(bottomLine)) {
                    result.push([x, sourceY + range]);
                }
            }

            for (let y = sourceY - range; y <= sourceY + range; y++) {
                const leftLine = mapCoords(sourceX - range, y);
                if (check(leftLine)) {
                    result.push([sourceX - range, y]);
                }

                const rightLine = mapCoords(sourceX + range, y);
                if (check(rightLine)) {
                    result.push([sourceX + range, y]);
                }
            }

            range++;
        }

        return result.reduce((result, [x, y, minRange]) => {
            const range = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));

            if (!result || range < minRange) {
                return [x, y, range];
            } else {
                return result;
            }
        }, null);
    }

    private buildTavernNavigator() {
        const tileCoords = this.searchForClosest(this.x, this.y,
                coords => !!(gameStore.map[coords] && gameStore.map[coords].buildingId) );

        if (!tileCoords) {
            return;
        }

        this.navigator.push(this.getNavigationTo(tileCoords[0], tileCoords[1]));
    }

    private buildScoutNavigator() {
        const [markX, markY] = this.scoutMark.split('x').map(coord => parseInt(coord, 10));
        const existingTile = this.searchForClosest(markX, markY, coords => !!gameStore.map[coords]);

        if (!existingTile) {
            return;
        }

        // The way from the hero to closest known tile
        this.navigator.push(this.getNavigationTo(existingTile[0], existingTile[1]));

        // The way from closest known tile to the target
        let minX;
        let minY;
        let maxX: number;
        let maxY: number;

        if (existingTile[0] < markX) {
            minX = existingTile[0];
            maxX = markX
        } else {
            minX = markX;
            maxX = existingTile[0]
        }

        if (existingTile[1] < markY) {
            minY = existingTile[1];
            maxY = markY
        } else {
            minY = markY;
            maxY = existingTile[1]
        }

        const grid = new PF.Grid((new Array(maxY - minY + 1))
            .fill((new Array(maxX - minX + 1)).fill(0)));
        const finder = new PF.AStarFinder();

        this.navigator.push({
            offsets: [minX, minY],
            path: finder.findPath(
                existingTile[0] - minX,
                existingTile[1] - minY,
                markX - minX,
                markY - minY,
                grid)
        });
    }
}
