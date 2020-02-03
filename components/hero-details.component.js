import React from "react";

export class HeroDetailsComponent extends React.Component {
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

                        return <li key={key}>{key}: {item}</li>
                    })}
                </ul>
            </div>
        </div>;
    }
}