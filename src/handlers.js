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

export function updateTask(req, res, id, body) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendError(res, 400, "body must be valid JSON");
  }
  if (parsed === null || typeof parsed !== "object") {
    return sendError(res, 400, "body must be a JSON object");
  }
  if (typeof parsed.title !== "string" || parsed.title.trim() === "") {
    return sendError(res, 400, "title is required");
  }
  if (parsed.title.length > MAX) {
    return sendError(res, 400, "title too long");
  }
  const task = store.find(Number(id));
  if (!task) {
    return sendError(res, 404, "task not found");
  }
  task.title = parsed.title;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

function sendError(res, status, message) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: message }));
}
