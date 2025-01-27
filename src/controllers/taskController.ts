import { Request, Response } from "express";
import prisma from "../prisma/PrismaClient";
import xss from "xss";

// GET TASK
export const getAllTasks = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(401).json({ message: "Cannot make Request" });
    return;
  }

  // checks task for a specifc user if
  const existingTasks = await prisma.task.findMany({
    where: {
      userId: id,
    },
  });

  // Check if tasks exist for the given user ID
  if (!existingTasks.length) {
    res.status(200).json({ message: "Task fetched successfully", data: [] });
    return;
  }

  res
    .status(200)
    .json({ message: "Task fetched successfully", data: existingTasks });
};

// ADD TASK
export const addTask = async (req: Request, res: Response) => {
  if (!req.is("application/json")) {
    res.status(415).json({ message: "unsupported media type" });
    return;
  }
  const { id } = req.params;

  if (!id) {
    res.status(401).json({ message: "Cannot make request" });
    return;
  }

  const { task_title, task_body, reminder, schedule, taskCategory } =
    await req.body;
  //   console.log("Current time (UTC):", new Date(Date.now()).toISOString());

  if (!task_title && !task_body && !reminder && !schedule && !taskCategory) {
    res.status(400).json({ message: "Invalid Fields" });
  }
  const sanitizedTaskbody = xss(task_body);
  const sanitizedTaskTitle = xss(task_title);
  try {
    // check for user using user id
    const userID = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    // if user does not exist
    if (!userID) {
      res.status(403).json({ message: "User not found" });
      return;
    }
    // all checks passed
    // create task
    const createTask = await prisma.task.create({
      data: {
        userId: id,
        task_title: sanitizedTaskTitle,
        task_body: sanitizedTaskbody,
        reminder,
        schedule,
        taskCategory,
      },
    });
    // return all data except userID
    const { userId, ...responseData } = createTask;
    res
      .status(201)
      .json({ message: "Task succesfully added", data: responseData });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// EDIT TASK
export const editTask = async (req: Request, res: Response) => {
  if (!req.is("application/json")) {
    res.status(415).json({ message: "unsupported media type" });
    return;
  }
  const { id } = req.params;
  if (!id) {
    res.status(401).json({ message: "Cannot make Request" });
    return;
  }

  // check for user using user id
  const userID = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  // if user does not exist
  if (!userID) {
    res.status(403).json({ message: "User not found" });
    return;
  }

  const { task_title, task_body, reminder, schedule, taskCategory, taskID } =
    await req.body;

  // if any field is empty
  if (
    !task_title ||
    !task_body ||
    !reminder ||
    !schedule ||
    !taskCategory ||
    !taskID
  ) {
    res.status(400).json({ message: "Invalid Fields" });
    return;
  }

  try {
    // check for task using user id
    const updatingTask = await prisma.task.findUnique({
      where: {
        id: taskID,
      },
    });
    // if user does not exist
    if (!updatingTask) {
      res.status(403).json({ message: "Task not found" });
      return;
    }

    // all checks passed
    // edit task
    const updateTask = await prisma.task.update({
      where: {
        id: taskID,
      },
      data: {
        ...(task_title && { task_title }),
        ...(task_body && { task_body }),
        ...(reminder && { reminder }),
        ...(schedule && { schedule }),
        ...(taskCategory && { taskCategory }),
      },
    });
    // return all data except userID
    const { userId, ...responseData } = updateTask;
    res.status(201).json({ message: "Update Successful", data: responseData });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE TASK
export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(401).json({ message: "Cannot make Request" });
    return;
  }

  try {
    const deleteTask = await prisma.task.delete({
      where: {
        id: id,
      },
    });

    if (!deleteTask) {
      res.status(400).json({ message: "Request Failed" });
      return;
    }
    res.status(200).json({ message: "Task Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
