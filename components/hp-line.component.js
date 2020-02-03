import React from "react";

export class HpLineComponent extends React.Component {
    render() {
        const current = Math.floor(100 / this.props.max * this.props.current);

        return <div style={{width: '100%', height: '5px', backgroundColor: 'red'}}>
            <div style={{height: '100%', width: `${current}%`, backgroundColor: 'green'}}></div>
        </div>;
    }
}