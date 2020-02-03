import {observable} from "mobx";
import {ITEMS_IDS} from "./items";

let nextBuildingId = 1;

export class Building {
    id = nextBuildingId;
    name = "Tavern " + nextBuildingId;
    @observable inventory = {};
    @observable forSell = {
        LEATHER_ARMOR: 10
    };
    @observable toBuy = {
        [ITEMS_IDS.LEATHER]: 2
    };

    constructor() {
        nextBuildingId++;
    }

    addItems(items) {
        Object.keys(items).forEach(type => {
            this.addItem(type, items[type]);
        });
    }

    makeItem() {
        this.inventory[ITEMS_IDS.LEATHER] -= 3;
        this.inventory[ITEMS_IDS.LEATHER_ARMOR] = this.inventory[ITEMS_IDS.LEATHER_ARMOR] ? this.inventory[ITEMS_IDS.LEATHER_ARMOR] + 1 : 1;
    }

    addItem(type, count) {
        this.inventory[type] = this.inventory[type] ? this.inventory[type] + count : count;
    }

    removeItem(type, count) {
        this.inventory[type] -= count;

        if (this.inventory[type] < 1) {
            delete this.inventory[type];
        }
    }
}