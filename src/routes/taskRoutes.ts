import express from "express";
import {
  getAllTasks,
  addTask,
  editTask,
  deleteTask,
} from "../controllers/taskController.js";
import { zodValidateData } from "../middleware/zodMiddleware.js";
import { addTaskMiddleware } from "../middleware/taskMiddleware.js";

const router = express.Router();

// get all task
router.get("/:id", getAllTasks);

// get today's task
router.get("/today", (req, res) => {});

// get yesterday's task
router.get("/yesterday", (req, res) => {});

// get tomorrow's task
router.get("/tommorrow", (req, res) => {});

// add
router.post("/:id", zodValidateData(addTaskMiddleware), addTask);

// edit(patch) task
router.patch("/:id", zodValidateData(addTaskMiddleware), editTask);

// delete task
router.delete("/:id", zodValidateData(addTaskMiddleware), deleteTask);

export default router;
