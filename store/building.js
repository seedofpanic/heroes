import {observable} from "mobx";

export class Building {
    name = "Tavern";
    @observable inventory = {};

    addItems(items) {
        Object.keys(items).forEach(key => {
            this.inventory[key] = this.inventory[key] ? this.inventory[key] + items[key] : items[key];
        });
    }

    makeItem() {
        this.inventory['leather'] -= 3;
        this.inventory['leather armor'] = this.inventory['leather armor'] ? this.inventory['leather armor'] + 1 : 1;
    }
}