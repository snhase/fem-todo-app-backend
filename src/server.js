const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectToDb = require("./db");

const PORT = process.env.PORT;
const collection = process.env.DB_COLLECTION;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.get("/", async (request, response) => {
  response.json({ message: "response OK from fem-todo-backend" });
});

app.get("/api/tasks", async (request, response) => {
  console.log("GET /tasks received");
  try {
    let { db } = await connectToDb();
    let taskList = await db.collection(collection).find({}).toArray();
    if (taskList) {
      response.json(taskList);
      console.log("GET /tasks response sent");
    } else {
      response.status(404).json({
        message: "task not found",
      });
    }
  } catch (error) {
    console.log(error);
    response.status(400).json({
      message: "error getting tasks",
    });
  }
});

app.post("/api/task", async (request, response) => {
  console.log("POST /task received");
  try {
    const { id } = request.body;
    let { db } = await connectToDb();
    let result = await db.collection(collection).insertOne(request.body);
    if (result) {
      const task = await db.collection(collection).findOne({ id: id });
      if (task) {
        delete task["_id"];
        response.json(task);
        console.log("POST /task response sent");
      } else {
        response.status(404).json({
          message: "task not found",
        });
      }
    } else {
      response.status(400).json({
        message: "error creating task",
      });
    }
  } catch (error) {
    console.log(error);
    response.status(400).json({
      message: "error creating task",
    });
  }
});

app.put("/api/task/:id", async (request, response) => {
  console.log("PUT /task received");
  try {
    const { id } = request.params;
    let { db } = await connectToDb();
    await db.collection(collection).updateOne(
      { id: parseInt(id) },
      {
        $set: request.body,
      }
    );
    const task = await db.collection(collection).findOne({ id: parseInt(id) });
    if (task) {
      delete task["_id"];
      response.json(task);
      console.log("PUT /task response sent");
    } else {
      response.status(404).json({
        message: "task not found",
      });
    }
  } catch (error) {
    console.log(error);
    response.status(400).json({
      message: "error updating task",
    });
  }
});

app.delete("/api/task/:id", async (request, response) => {
  console.log("DELETE /task received");
  try {
    let { db } = await connectToDb();
    const { id } = request.params;
    let ids = id.split(",");
    let results = [];
    for (let i = 0; i < ids.length; i++) {
      let result = await db
        .collection(collection)
        .deleteOne({ id: parseInt(ids[i]) });
      result["id"] = ids[i];
      results.push(result);
    }
    const wasDeleted = (currentValue) => currentValue.deletedCount === 1;
    if (results.every(wasDeleted)) {
      response.json({ status: "success" });
      console.log("DELETE /task response sent");
    } else {
      let errors = results
        .filter((currentValue) => currentValue.deletedCount === 0)
        .map((item) => item.id);
      response.status(400).json({
        message: `error deleting task(s) ${
          errors.length > 0
            ? "with id(s) " + errors.toString().split("").join(" ")
            : ""
        }`,
      });
    }
  } catch (error) {
    console.log(error);
    response.status(400).json({
      message: "error deleting task",
    });
  }
});

app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});

module.exports = app;
