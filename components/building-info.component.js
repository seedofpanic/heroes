import React from "react";

export class BuildingInfoComponent extends React.Component {
    render() {
        const {building} = this.props;

        if (!building) {
            return '';
        }

        return <div>
            <div>{building.name}</div>
            <div>Store</div>
            <ul>
                {Object.keys(building.inventory).map(key => {
                    const item = building.inventory[key];

                    return <li key={key}>{key}: {item}</li>
                })}
            </ul>
            <div>
                {building.inventory['leather'] > 3 ? <button onClick={() => this.makeItem()}>Make leather armor</button> : ''}
            </div>
        </div>;
    }

    makeItem() {
        this.props.building.makeItem()
    }
}