import {computed, observable} from "mobx";
import PF from "pathfinding";
import {gameStore, mapCoords} from "./game.store";
import {Tile} from "./tile";
import {random} from "./random";
import {EQUIP_SLOTS, items, ITEMS_TYPES} from "./items";
import {LootItem} from "./mob";

let nextHeroNumber = 1;

interface Quest {
    type: string;
    coords: string;
    navigator: NavigationRoute[];
}

interface NavigationRoute {
    offsets: [number, number];
    path: [number, number][];
}

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
    navigator: NavigationRoute[] = [];
    @observable inventory = {};
    @observable money = 0;
    @observable equip: { [name: string]: ITEMS_TYPES } = {
        [EQUIP_SLOTS.CHEST]: null
    };
    quest: Quest;
    isFleeing: boolean;

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

        if (tile.buildingId) {
            const building = gameStore.buildings[tile.buildingId];
            this.sellItems(building);
            this.buyItems(building);

            if (this.currentHealth < this.maxHealth) {
                this.heal(10);
                this.isFleeing = false;

                return;
            }
        }

        if (!this.isFleeing && tile.mobs.length > 0) {
            this.engage(tile);
            return;
        }

        if (!this.navigator.length && !this.quest) {
            if (!this.checkQuests()) {
                this.buildScoutClosestNavigator()
            }
        }

        if (this.quest && this.quest.navigator.length) {
            this.aiNavigation(this.quest.navigator);
            return;
        }
        if (this.navigator.length) {
            this.aiNavigation(this.navigator);
            return;
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
            const price = building.forSell[itemType];

            if (price) {
                if (!this.inventory[itemType] && price <= this.money) {
                    this.addItem(itemType, 1);
                    building.removeItem(itemType, 1);
                    this.money -= price;
                    gameStore.money += price;
                }
            }
        });
    }

    aiNavigation(navigators) {
        const navigator = navigators[0];

        if (navigator.path.length) {
            const step = navigator.path.shift();

            this.move(step[0] + navigator.offsets[0], step[1] + navigator.offsets[1]);
        }

        if (!navigator.path.length) {
            navigators.shift();
        }
    }

    removeQuest() {
        if (!this.quest) {
            return;
        }

        switch (this.quest.type) {
            case 'scout':
                if (gameStore.scoutMarks[this.quest.coords]) {
                    gameStore.scoutMarks[this.quest.coords].heroId = null;
                }
                break;
            case 'kill':
                if (gameStore.scoutMarks[this.quest.coords]) {
                    gameStore.scoutMarks[this.quest.coords].heroId = null;
                }
                break;
        }

        this.quest = null;
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
            gameStore.addTile(x, y);
        }

        gameStore.map[to].heroes.push(this.id);

        this.x = x;
        this.y = y;
    }

    getDamage() {
        const weaponDamage = this.equip[EQUIP_SLOTS.RIGHT_HAND] ? items[this.equip[EQUIP_SLOTS.RIGHT_HAND]]
            .stats.damage : [0, 0];

        return random(this.damageMin + weaponDamage[0], this.damageMax + weaponDamage[1]);
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
        this.equipItem(type);
    }

    equipItem(type: ITEMS_TYPES) {
        if (!this.inventory[type] || !items[type].equippable) {
            return;
        }

        this.equip[items[type].equippable] = type;
    }

    hit(damage: number) {
        const finalDamage = damage / this.armor;
        this.currentHealth -= finalDamage < 1 ? 1 : Math.floor(finalDamage);

        if (this.currentHealth <= this.maxHealth / 10) {
            this.removeQuest();

            this.buildTavernNavigator();

            if (this.navigator.length) {
                this.isFleeing = true;
            }
        }

        if (this.currentHealth <= 0) {
            this.die();
        }
    }

    getNavigationTo(x: number, y: number, avoidMobs: boolean): NavigationRoute {
        const grid = new PF.Grid(gameStore.genPathArray(avoidMobs));
        const finder = new PF.AStarFinder();
        const {minX, minY} = gameStore;
        const path = finder.findPath(this.x - minX, this.y - minY, x - minX, y - minY, grid);

        path.shift();

        return {
            offsets: [minX, minY],
            path
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
            this.quest = {
                navigator: this.buildScoutMarkNavigator(scoutMarks[0]),
                type: 'scout',
                coords: scoutMarks[0]
            };
            gameStore.scoutMarks[this.quest.coords].heroId = this.id;

            return true;
        }

        const killMarks = Object.keys(gameStore.killMarks);

        if (killMarks.length > 0) {
            this.quest = {
                navigator: this.buildKillNavigator(killMarks[0]),
                type: 'kill',
                coords: killMarks[0]
            };
            gameStore.killMarks[this.quest.coords].heroId = this.id;

            return true;
        }

        return false;
    }

    static lookForAllClosest(sourceX: number, sourceY: number, check: (coords: string) => boolean): [number, number, number][] {
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

        return result;
    }

    private lookForClosest(sourceX: number, sourceY: number, check: (coords: string) => boolean): [number, number, number] {
        const closestTiles = Hero.lookForAllClosest(sourceX, sourceY, check);

        return closestTiles.reduce((result, [x, y, minRange]) => {
            const range = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));

            if (!result || range < minRange) {
                return [x, y, range];
            } else {
                return result;
            }
        }, null);
    }

    private buildKillNavigator(coords: string): NavigationRoute[] {
        const [markX, markY] = coords.split('x').map(coord => parseInt(coord, 10));

        return [this.getNavigationTo(markX, markY, false)];
    }

    private buildTavernNavigator() {
        const tileCoords = this.lookForClosest(this.x, this.y,
            coords => !!(gameStore.map[coords] && gameStore.map[coords].buildingId));

        if (!tileCoords) {
            debugger;
            return;
        }

        this.navigator = [this.getNavigationTo(tileCoords[0], tileCoords[1], false)];
    }

    private buildScoutMarkNavigator(coords: string): NavigationRoute[] {
        const [markX, markY] = coords.split('x').map(coord => parseInt(coord, 10));
        return this.buildScoutNavigator(markX, markY);
    }

    private buildScoutNavigator(scoutX: number, scoutY: number): NavigationRoute[] {
        const navigator = [];
        const existingTile = this.lookForClosest(scoutX, scoutY, coords => !!gameStore.map[coords]);

        if (!existingTile) {
            return;
        }

        // The way from the hero to closest known tile
        if (existingTile[0] !== this.x || existingTile[1] !== this.y) {
            navigator.push(this.getNavigationTo(existingTile[0], existingTile[1], false));
        }

        // The way from closest known tile to the target
        let minX;
        let minY;
        let maxX: number;
        let maxY: number;

        if (existingTile[0] < scoutX) {
            minX = existingTile[0];
            maxX = scoutX
        } else {
            minX = scoutX;
            maxX = existingTile[0]
        }

        if (existingTile[1] < scoutY) {
            minY = existingTile[1];
            maxY = scoutY
        } else {
            minY = scoutY;
            maxY = existingTile[1]
        }

        const grid = new PF.Grid((new Array(maxY - minY + 1))
            .fill((new Array(maxX - minX + 1)).fill(0)));
        const finder = new PF.AStarFinder();
        const path = finder.findPath(
            existingTile[0] - minX,
            existingTile[1] - minY,
            scoutX - minX,
            scoutY - minY,
            grid);

        path.shift();

        navigator.push({
            offsets: [minX, minY],
            path
        });

        return navigator;
    }

    private buildScoutClosestNavigator() {
        const tiles = Hero.lookForAllClosest(this.x, this.y, coords => !gameStore.map[coords]);
        const [x, y] = tiles[random(0, tiles.length - 1)];
        this.navigator = this.buildScoutNavigator(x, y);
    }
}
