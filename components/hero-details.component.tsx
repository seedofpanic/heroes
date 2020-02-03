import React from "react";
import {items} from "../store/items";
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
                <div>Money: {hero.money}</div>
                <div>Inventory</div>
                <ul>
                    {Object.keys(hero.inventory).map(key => {
                        const item = hero.inventory[key];

                        return <li key={key}>{items[key].name}: {item}</li>
                    })}
                </ul>
            </div>
        </div>;
    }
}