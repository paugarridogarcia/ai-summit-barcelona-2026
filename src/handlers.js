import * as store from "./store.js";

const MAX = 140;

function sendError(res, status, message) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: message }));
}

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
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendError(res, 400, "invalid JSON");
  }
  const title = parsed && parsed.title;
  if (typeof title !== "string" || title.trim() === "") {
    return sendError(res, 400, "title is required");
  }
  if (title.length > MAX) {
    return sendError(res, 400, "title too long");
  }
  const task = store.find(Number(id));
  if (!task) {
    return sendError(res, 404, "not found");
  }
  task.title = title;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}
