import React from "react";
import {gameStore} from "../store/game.store";
import {observer} from "mobx-react";
import Button from "react-bootstrap/Button";

@observer
export class HiddenTileDetailComponent extends React.Component<{coords: string}>{
    render() {
        const {coords} = this.props;
        const hasMoneyForScout = gameStore.money < 5;

        return <div>
            {gameStore.scoutMarks[coords]
                ? <div>Scouting...</div>
                : <Button onClick={() => this.addScoutMark()} className={hasMoneyForScout ? 'btn-secondary' : ''} disabled={hasMoneyForScout}>Scout</Button>}
        </div>;
    }

    addScoutMark() {
        gameStore.addScoutMark(this.props.coords);
    }
}