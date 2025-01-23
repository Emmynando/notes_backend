import { z } from "zod";

export const addTaskMiddleware = z.object({
  task_title: z.string().nonempty("Task title is required."),
  task_body: z.string().nonempty("Task title is required."),
  taskCategory: z.string().nonempty("Task Category is required."),
  reminder: z.coerce.date({
    required_error: "Please select a date and time",
    invalid_type_error: "That's not a date!",
  }),
  schedule: z.coerce
    .date({
      required_error: "Please select a date and time",
      invalid_type_error: "That's not a date!",
    })
    .refine(
      (date) => {
        const currentTime = Date.now(); // Current time in milliseconds
        return date.getTime() > currentTime + 15 * 60 * 1000;
      },
      {
        message: "Your schedule should be at least 15 minutes from now.",
      }
    ),
});
