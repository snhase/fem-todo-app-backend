import express from 'express';
import { db, connectToDb } from './db.js';

const app = express();
app.use(express.json());

app.get("/api/tasks", async (request, response) => {
    try {
        const cursor = await db.collection("tasks").find({});
        let taskList = [];
        await cursor.forEach(item => {
            delete item["_id"];
            return (taskList.push(item));
        }); 

        if (taskList) {
            response.json(taskList);
        } else {
            response.status(404).json({ 
                message: "task not found"
            });
        }
    } catch(error){
        console.log(error);
        response.status(400).json({ 
            message: "error getting tasks"
        });
    }
});

app.post("/api/task", async (request, response) => {
    try {
        const { id } = request.body;
        await db.collection("tasks").insertOne(request.body);
        const task = await db.collection("tasks").findOne({id:id});

        if (task) {
            delete task["_id"];
            response.json(task);
        } else {
            response.status(404).json({ 
                message: "task not found"
            });        }
    } catch(error){
        console.log(error);
        response.status(400).json({ 
            message: "error creating task"
        });
    }
});

app.put("/api/task/:id", async (request, response) => {
    try {
        const { id } = request.params;
        await db.collection("tasks").updateOne({id:parseInt(id)}, {
            $set: request.body,
        });
        const task = await db.collection("tasks").findOne({id:parseInt(id)});

        if (task) {
            delete task["_id"];
            response.json(task);
        } else {
            response.status(404).json({ 
                message: "task not found"
            });
        }
    } catch(error) {
        console.log(error);
        response.status(400).json({ 
            message: "error updating task"
        });
    }
});

app.delete("/api/task/:id", async (request, response) => {
    try{
        const { id } = request.params;
        const result = await db.collection("tasks").deleteOne({id:parseInt(id)});

        if (result && result.deletedCount === 1) {
            response.json({ status: "success"});
        } else {
            if(result.deletedCount === 0){
                response.status(404).json({ 
                    message: "error deleting task"
               });
            }
        }
    } catch(error){
        console.log(error);
        response.status(400).json({ 
            message: "error deleting task"
        });
    }
});

connectToDb(() => {
    console.log("Successfully connected to database!");
    app.listen(8000, () => {
        console.log("Server is listening on port 8000");
    });
})
