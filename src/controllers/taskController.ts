import { Request, Response } from "express";

// get all task
export const getAllTasks = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "User does not exist" });
    return;
  }
  res.status(200).json({ message: "Task fetched successfully" });
};

// add task
export const addTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: "User does not exist" });
    return;
  }

  const { task_title, task_body, reminder, schedule, category } =
    await req.body;
  //   console.log("Current time (UTC):", new Date(Date.now()).toISOString());

  if (!task_title && !task_body && !reminder && !schedule && !category) {
    res.status(400).json({ message: "Invalid Fields" });
  }
  try {
    res.status(200).json({ message: "Task succesfully added", data: req.body });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
