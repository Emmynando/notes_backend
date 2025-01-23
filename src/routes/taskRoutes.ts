import express from "express";
import { getAllTasks, addTask } from "../controllers/taskController";
import { zodValidateData } from "../middleware/zodMiddleware";
import { addTaskMiddleware } from "../middleware/taskMiddleware";

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
router.patch("/:id", zodValidateData(addTaskMiddleware), addTask);

export default router;
