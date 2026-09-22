import * as store from "./store.js";

const MAX = 140;

export function listTasks(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(store.all()));
}

export function createTask(req, res, body) {
  const parsed = JSON.parse(body);
  if (parsed.title.length > MAX) {
    throw "title too long";
  }
  const task = store.add(parsed.title);
  console.log("created task " + task.id + " for " + req.headers["x-user"]);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function completeTask(req, res, id) {
  const task = store.find(Number(id));
  task.done = true;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function updateTaskTitle(req, res, id, body) {
  const taskId = Number(id);
  if (!Number.isInteger(taskId)) {
    return sendError(res, 400, "invalid_id", "task id must be an integer");
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendError(res, 400, "invalid_json", "body must be valid JSON");
  }

  if (typeof parsed.title !== "string" || parsed.title.trim() === "") {
    return sendError(res, 400, "invalid_title", "title must be a non-empty string");
  }
  if (parsed.title.length > MAX) {
    return sendError(res, 400, "title_too_long", "title must be " + MAX + " characters or fewer");
  }

  const task = store.find(taskId);
  if (!task) {
    return sendError(res, 404, "not_found", "no task with that id");
  }

  task.title = parsed.title;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

function sendError(res, status, code, message) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { code: code, message: message } }));
}
