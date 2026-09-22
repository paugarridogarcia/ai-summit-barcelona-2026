import * as store from "./store.js";
import { logger } from "./logger.js";

const MAX = 140;

export function listTasks(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(store.all()));
}

export function createTask(req, res, body) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendError(res, 400, "invalid_json", "body must be valid JSON");
  }

  const title = parsed && parsed.title;
  if (typeof title !== "string" || title.trim() === "") {
    return sendError(res, 400, "invalid_title", "title must be a non-empty string");
  }
  if (title.length > MAX) {
    return sendError(res, 400, "title_too_long", "title must be " + MAX + " characters or fewer");
  }

  const task = store.add(title);
  logger.info("task.created", { taskId: task.id, user: req.headers["x-user"] });
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function completeTask(req, res, id) {
  const taskId = Number(id);
  if (!Number.isInteger(taskId) || taskId < 1) {
    return sendError(res, 400, "invalid_id", "task id must be a positive integer");
  }

  const task = store.find(taskId);
  if (!task) {
    return sendError(res, 404, "not_found", "no task with that id");
  }

  task.done = true;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function updateTaskTitle(req, res, id, body) {
  const taskId = Number(id);
  if (!Number.isInteger(taskId) || taskId < 1) {
    return sendError(res, 400, "invalid_id", "task id must be a positive integer");
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendError(res, 400, "invalid_json", "body must be valid JSON");
  }

  const title = parsed && parsed.title;
  if (typeof title !== "string" || title.trim() === "") {
    return sendError(res, 400, "invalid_title", "title must be a non-empty string");
  }
  if (title.length > MAX) {
    return sendError(res, 400, "title_too_long", "title must be " + MAX + " characters or fewer");
  }

  const task = store.find(taskId);
  if (!task) {
    return sendError(res, 404, "not_found", "no task with that id");
  }

  task.title = title;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function deleteTask(req, res, id) {
  const taskId = Number(id);
  if (!Number.isInteger(taskId) || taskId < 1) {
    return sendError(res, 400, "invalid_id", "task id must be a positive integer");
  }

  if (!store.remove(taskId)) {
    return sendError(res, 404, "not_found", "no task with that id");
  }

  res.writeHead(204);
  res.end();
}

function sendError(res, status, code, message) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { code: code, message: message } }));
}
