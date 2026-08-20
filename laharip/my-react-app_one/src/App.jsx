
import React from 'react'
import { useState } from 'react'

import "./App.css"

function App() {
  const [todo, settodo] = useState([]);
  const [text, settext] = useState("");

  function addtask(event) {
    event.preventDefault();

    if (text.trim() === "") {
      return;
    }

    settodo([...todo, {
      id: todo.length + 1,
      text: text,
      completed: false
    }]);

    settext("");
  }

  function completetask(id) {
    settodo(
      todo.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  }

  return (
    <div className="todo-container">
      <h1>Todo App</h1>

      <form onSubmit={addtask}>
        <input
          type="text"
          value={text}
          onChange={(e) => settext(e.target.value)}
          placeholder="Enter your task"
        />

        <button type="submit">Add</button>
      </form>

      <ul>
        {todo.map((item) => (
          <li key={item.id}>
            <span className={item.completed ? "completed" : ""}>
              {item.text}
            </span>

            <button onClick={() => completetask(item.id)}>
              {item.completed ? "Undo" : "Complete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
