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
