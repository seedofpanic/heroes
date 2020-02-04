import React from "react";
import {items, ITEMS_TYPES} from "../store/items";
import {Building} from "../store/building";
import {observer} from "mobx-react";

@observer
export class BuildingInfoComponent extends React.Component {
    props: {building: Building};

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

                    return <li key={key}>{items[key].name}: {item}</li>
                })}
            </ul>
            <div>
                {building.inventory[ITEMS_TYPES.LEATHER] >= 3 ? <button onClick={() => this.makeItem()}>Make leather armor</button> : ''}
            </div>
        </div>;
    }

    makeItem() {
        this.props.building.makeItem()
    }
}