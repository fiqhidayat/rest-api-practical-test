import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import { appendFile, mkdir } from "node:fs/promises";
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
} from "./services";

const app = new Hono();

app.onError((error, c) => {
    console.error(error);

    return c.json(
        {
            error: "Internal server error",
        },
        500,
    );
});

app.use("*", async (c, next) => {
    const startedAt = Date.now();
    let requestFailed = false;

    try {
        await next();
    } catch (error) {
        requestFailed = true;
        throw error;
    } finally {
        const log = {
            time: new Date().toISOString(),
            method: c.req.method,
            path: c.req.path,
            status: requestFailed ? 500 : c.res.status,
            durationMs: Date.now() - startedAt,
            userAgent: c.req.header("user-agent"),
        };

        try {
            await mkdir("logs", { recursive: true });
            await appendFile("logs/access.log", JSON.stringify(log) + "\n");
        } catch (error) {
            console.error("Failed to write access log", error);
        }
    }
});

app.get("/", (c) => {
    //for health check
    return c.json({ message: "Hello World" });
});

app.use(logger());
app.use(prettyJSON());
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.use("/api/*", async (c, next) => {
    await next();
    c.res.headers.set("Access-Control-Allow-Origin", "*");
    c.res.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
    );
    c.res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
    );
    c.res.headers.set("Access-Control-Allow-Credentials", "true");
});

app.get("/api", (c) => {
    return c.json({ message: "Api is working" });
});

app.get("/api/tasks", (c) => getTasks(c));
app.get("/api/tasks/:id", (c) => getTaskById(c));
app.post("/api/tasks", (c) => createTask(c));
app.put("/api/tasks/:id", (c) => updateTask(c));
app.patch("/api/tasks/:id/status", (c) => updateTaskStatus(c));
app.delete("/api/tasks/:id", (c) => deleteTask(c));

export default app;
