import {observer} from "mobx-react"
import React from "react";
import {todoStore} from "../../store/todos.store";

@observer
export class TodosComponent extends React.Component {
    value = '';

    render() {
        return <div>
            <div><input type="text" value={todoStore.todoToAdd.title} onChange={(event) => this.setAddValue(event)}/><button type="button" onClick={() => this.add()}>add</button></div>
            <ul>
                {todoStore.todos.map(todo => <li><input type="checkbox" onChange={(event) => todoStore.complete(todo, event.target.checked)}
                                                                   checked={todo.completed}/>{todo.title}</li>)}
            </ul>
            <div>
                {todoStore.todos.length}/{todoStore.completedCount}
            </div>
        </div>
    }

    setAddValue(e) {
        todoStore.todoToAdd.title = e.target.value;
    }

    add() {
        todoStore.add();
    }
}