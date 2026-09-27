import { db } from "./db";
import { tasksTable } from "./db/schema.js";
import { eq } from "drizzle-orm";
import zod from "zod";

export const getTasks = async (ctx: any) => {
    const allTasks = await db.query.tasksTable.findMany();

    //if there are no tasks, return an error
    if (allTasks.length === 0) {
        ctx.status(404);
        return ctx.json({ error: "No tasks found" });
    }

    return ctx.json({ data: allTasks });
};

export const getTaskById = async (ctx: any) => {
    const id = ctx.req.param("id");

    const task = await db.query.tasksTable.findFirst({
        where: eq(tasksTable.id, id),
    });

    if (!task) {
        ctx.status(404);
        return ctx.json({ error: "Task not found" });
    }

    return ctx.json({ data: task });
};

export const createTask = async (ctx: any) => {
    let body: unknown;

    try {
        body = await ctx.req.json();
    } catch {
        ctx.status(400);
        return ctx.json({ error: "Invalid request body" });
    }

    //validate the body
    const taskSchema = zod.object({
        title: zod.string().min(3).max(255),
        description: zod.string(),
        status: zod.enum(["todo", "on progress", "done"]),
        priority: zod.string(),
    });

    const result = taskSchema.safeParse(body);

    if (!result.success) {
        const details = result.error.issues.reduce<Record<string, string>>(
            (errors, issue) => {
                const field = String(issue.path[0] ?? "body");
                errors[field] =
                    issue.code === "invalid_type" && issue.input === undefined
                        ? `${field} is required`
                        : issue.message;
                return errors;
            },
            {},
        );

        ctx.status(400);
        return ctx.json({ error: "Please provide valid data", details });
    }

    try {
        const newTask = await db
            .insert(tasksTable)
            .values(result.data)
            .returning();

        return ctx.json({ data: newTask });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("UNIQUE constraint failed: tasks.title")
        ) {
            ctx.status(409);
            return ctx.json({
                error: "Task title already exists, Please use a different title",
            });
        }

        throw error;
    }
};

export const updateTask = async (ctx: any) => {
    const id = ctx.req.param("id");

    let body: unknown;

    try {
        body = await ctx.req.json();
    } catch {
        ctx.status(400);
        return ctx.json({ error: "Invalid request body" });
    }

    //validate the body
    const taskSchema = zod
        .object({
            title: zod.string().min(3).max(255),
            description: zod.string(),
            status: zod.enum(["todo", "on progress", "done"]),
            priority: zod.string(),
        })
        .partial()
        .refine((data) => Object.keys(data).length > 0, {
            message: "At least one field is required",
        });

    const result = taskSchema.safeParse(body);

    if (!result.success) {
        ctx.status(400);
        return ctx.json({ error: "At least one valid field is required" });
    }

    try {
        const updatedTask = await db
            .update(tasksTable)
            .set(result.data)
            .where(eq(tasksTable.id, id))
            .returning();

        if (updatedTask.length === 0) {
            ctx.status(404);
            return ctx.json({ error: "Task not found" });
        }

        return ctx.json({ data: updatedTask });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("UNIQUE constraint failed: tasks.title")
        ) {
            ctx.status(409);
            return ctx.json({
                error: "Task title already exists, Please use a different title",
            });
        }

        throw error;
    }
};

export const updateTaskStatus = async (ctx: any) => {
    const id = ctx.req.param("id");
    const body = await ctx.req.json();

    const taskSchema = zod.object({
        status: zod.enum(["todo", "on progress", "done"]),
    });

    const result = taskSchema.safeParse(body);

    if (!result.success) {
        ctx.status(400);
        return ctx.json({
            error: "Validation failed",
            details: {
                status: "status must be one of: todo, on progress, done",
            },
        });
    }

    try {
        const updatedTask = await db
            .update(tasksTable)
            .set(result.data)
            .where(eq(tasksTable.id, id))
            .returning();

        if (updatedTask.length === 0) {
            ctx.status(404);
            return ctx.json({ error: "Task not found" });
        }

        return ctx.json({ data: updatedTask });
    } catch (error) {
        throw error;
    }
};

export const deleteTask = async (ctx: any) => {
    const id = ctx.req.param("id");

    try {
        const deletedTask = await db
            .delete(tasksTable)
            .where(eq(tasksTable.id, id))
            .returning();

        if (deletedTask.length === 0) {
            ctx.status(404);
            return ctx.json({ error: "Task not found" });
        }

        return ctx.json({ data: deletedTask });
    } catch (error) {
        throw error;
    }
};
