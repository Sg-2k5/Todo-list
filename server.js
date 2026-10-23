const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const app = express();
// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// GET method to retrieve tasks
app.get("/api/tasks", (req, res) => {
  pool.query(
    "SELECT id, task AS text, status, createdAt, completedAt FROM tasks",
    (err, rows) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(200).json(rows);
    },
  );
});

// PUT method to edit a task
app.put("/api/tasks/:id", (req, res) => {
  const task_id = req.params.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({
      error: "Task description is required",
    });
  }

  pool.query(
    "UPDATE tasks SET task = ? WHERE id = ?",
    [text.trim(), task_id],
    (err, result) => {
      if (err) {
        console.error("Error editing task:", err);
        return res.status(500).json({
          error: "Failed to update task",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Task not found",
        });
      }

      res.status(200).json({
        message: "Task updated successfully",
      });
    },
  );
});
//Creating a task
app.post("/api/tasks", (req, res) => {
  const text = req.body.text;

  if (!text || !text.trim()) {
    return res.status(400).json({
      error: "Task description is required",
    });
  }

  pool.query(
    `INSERT INTO tasks (task, status, createdAt, completedAt)
     VALUES (?, 'pending', NOW(), NULL)`,
    [text.trim()],
    (err, result) => {
      if (err) {
        console.error("Error adding task:", err);
        return res.status(500).json({
          error: "Failed to add task",
        });
      }

      res.status(201).json({
        message: "Task added successfully",
        id: result.insertId,
      });
    },
  );
});
//updating whether the task is completed or pending
app.patch("/api/tasks/:id/status", (req, res) => {
  const task_id = req.params.id;
  const { status } = req.body;

  if (!["pending", "completed"].includes(status)) {
    return res.status(400).json({
      error: "Status must be pending or completed",
    });
  }
  //At what time the task was completed
  const completed_at = status === "completed" ? new Date() : null;

  pool.query(
    "UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?",
    [status, completed_at, task_id],
    (err, result) => {
      if (err) {
        console.error("Error updating task status:", err);
        return res.status(500).json({
          error: "Failed to update task status",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Task not found",
        });
      }

      res.status(200).json({
        message: "Task status updated successfully",
      });
    },
  );
});
//deleting a task
app.delete("/api/tasks/:id", (req, res) => {
  const task_id = req.params.id;

  pool.query("DELETE FROM tasks WHERE id = ?", [task_id], (err, result) => {
    if (err) {
      console.error("Error deleting task:", err);

      return res.status(500).json({
        error: "Failed to delete task",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  });
});

// Start the server
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
