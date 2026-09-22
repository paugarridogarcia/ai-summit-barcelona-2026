import http from "node:http";
import { listTasks, createTask, completeTask, updateTaskTitle } from "./handlers.js";

const PORT = 3000;

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const url = req.url || "/";

    if (req.method === "GET" && url === "/tasks") {
      return listTasks(req, res);
    }
    if (req.method === "POST" && url === "/tasks") {
      return createTask(req, res, body);
    }
    if (req.method === "POST" && url.startsWith("/tasks/")) {
      return completeTask(req, res, url.split("/")[2]);
    }
    if (req.method === "PATCH" && url.startsWith("/tasks/")) {
      return updateTaskTitle(req, res, url.split("/")[2], body);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end('{"error":"not found"}');
  });
});

server.listen(PORT, () => {
  console.log("listening on http://localhost:" + PORT);
});
