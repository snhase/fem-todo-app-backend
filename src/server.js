import "./loadEnv.js";
import express from "express";
import { db, connectToDb } from "./db.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.get("/api/tasks", async (request, response) => {
  console.log("GET /tasks received");
  try {
    const cursor = await db.collection("tasks").find({});
    let taskList = [];
    await cursor.forEach((item) => {
      delete item["_id"];
      return taskList.push(item);
    });

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
    await db.collection("tasks").insertOne(request.body);
    const task = await db.collection("tasks").findOne({ id: id });

    if (task) {
      delete task["_id"];
      response.json(task);
      console.log("POST /task response sent");
    } else {
      response.status(404).json({
        message: "task not found",
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
    await db.collection("tasks").updateOne(
      { id: parseInt(id) },
      {
        $set: request.body,
      }
    );
    const task = await db.collection("tasks").findOne({ id: parseInt(id) });

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
    const { id } = request.params;
    let ids = id.split(",");
    let results = [];
    for (let i = 0; i < ids.length; i++) {
      let result = await db
        .collection("tasks")
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

connectToDb(() => {
  console.log("Successfully connected to database!");
  app.listen(8000, () => {
    console.log("Server is listening on port 8000");
  });
});

export default app;
