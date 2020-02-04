import React from "react";
import {EQUIP_SLOTS, items} from "../store/items";
import {observer} from "mobx-react";
import {Hero} from "../store/hero";

@observer
export class HeroDetailsComponent extends React.Component {
    props: {hero: Hero};

    render() {
        const {hero} = this.props;

        return <div>
            <div>{hero.name}</div>
            <div>HP: {hero.currentHealth}/{hero.maxHealth}</div>
            <div>
                {this.renderEquippedItem(hero, 'Chest', EQUIP_SLOTS.CHEST)}
            </div>
            <div>
                <div>Money: {hero.money}</div>
                <div>Inventory</div>
                {this.renderInventory(hero)}
            </div>
        </div>;
    }

    renderInventory(hero) {
        return <ul>
            {Object.keys(hero.inventory).map(key => {
                const item = hero.inventory[key];

                return <li key={key}>{items[key].name}: {item}</li>
            })}
        </ul>;
    }

    renderEquippedItem(hero: Hero, slotName: string, slot: EQUIP_SLOTS) {
        if (!hero.equip[slot]) {
            return '';
        }

        return <div>{slotName}: {items[hero.equip[slot]].name}</div>;
    }
}