const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

// //API 1a -- Returns a list of all todos whose status is 'TO DO'
// app.get("/todos/", async (request, response) => {
//   const { status } = request.query;
//   const getToDosQuery = `
//     SELECT * FROM todo
//     WHERE
//         status LIKE "%${status}%";
//   `;
//   const toDoArray = await db.all(getToDosQuery);
//   response.send(toDoArray);
// });

// //API 1b -- Returns a list of all todos whose priority is 'HIGH'
// app.get("/todos/", async (request, response) => {
//   const { priority } = request.query;
//   const getPriorityToDoQuery = `
//         SELECT * FROM todo
//         WHERE
//             priority = "%${priority}%";
//     `;
//   const priorityToDos = await db.all(getPriorityToDoQuery);
//   response.send(priorityToDos);
// });

// //API 1c -- Returns a list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'
// app.get("/todos/", async (request, response) => {
//   const { priority, status } = request.query;
//   const getHighInProgressToDosQuery = `
//         SELECT * FROM todo
//         WHERE
//             status LIKE "${status}"
//             AND priority LIKE "${priority}";
//     `;
//   const highInProgressToDos = await db.all(getHighInProgressToDosQuery);
//   response.send(highInProgressToDos);
// });

// //API 1d -- Returns a list of all todos whose todo contains 'Play' text
// app.get("/todos/", async (request, response) => {
//   const { search_q } = request.query;
//   const getPlayToDoQuery = `
//     SELECT * FROM todo
//     WHERE
//         todo LIKE "%${search_q}%";
//   `;
//   const playToDos = await db.all(getPlayToDoQuery);
//   response.send(playToDos);
// });

//API 2 -- Returns a specific todo based on the todo ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getToDoQuery = `
        SELECT * FROM todo
        WHERE
            id = ${todoId};
    `;
  const specificToDo = await db.get(getToDoQuery);
  response.send(specificToDo);
});

//API 3 -- Create a todo in the todo table
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addToDOQuery = `
        INSERT INTO todo
        (id, todo, priority, status)
        VALUES(
            ${id},
            '${todo}',
            '${priority}',
            '${status}'
        );
    `;
  await db.run(addToDOQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

// //API 4a -- Updates the details of a specific todo based on the todo ID
// app.put("/todos/:todoId/", async (request, response) => {
//   const { todoId } = request.params;
//   const { status } = request.body;
//   const updateToDoQuery = `
//         UPDATE todo
//         SET
//             status = '${status}'
//         WHERE
//             id = ${todoId};
//     `;
//   await db.run(updateToDoQuery);
//   response.send("Status Updated");
// });

// //API 4b -- Updates the details of a specific todo based on the todo ID
// app.put("/todos/:todoId/", async (request, response) => {
//   const { todoId } = request.params;
//   const { priority } = request.body;
//   const updateToDoQuery = `
//         UPDATE todo
//         SET
//             priority = '${priority}'
//         WHERE
//             id = ${todoId};
//     `;
//   await db.run(updateToDoQuery);
//   response.send("Priority Updated");
// });

// //API 4c -- Updates the details of a specific todo based on the todo ID
// app.put("/todos/:todoId/", async (request, response) => {
//   const { todoId } = request.params;
//   const { todo } = request.body;
//   const updateToDoQuery = `
//         UPDATE todo
//         SET
//             todo = '${todo}'
//         WHERE
//             id = ${todoId};
//     `;
//   await db.run(updateToDoQuery);
//   response.send("Todo Updated");
// });

//API 5 -- Deletes a todo from the todo table based on the todo ID
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteToDOQuery = `
        DELETE FROM todo
        WHERE 
            id = ${todoId};
    `;
  await db.run(deleteToDOQuery);
  response.send("Todo Deleted");
});

module.exports = app;
