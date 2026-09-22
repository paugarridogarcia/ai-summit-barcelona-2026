import http from "node:http";
import { listTasks, createTask, completeTask, updateTaskTitle, deleteTask } from "./handlers.js";
import { logger } from "./logger.js";

const PORT = 3000;

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const url = req.url || "/";
    const queryStart = url.indexOf("?");
    const pathname = queryStart === -1 ? url : url.slice(0, queryStart);
    const query = new URLSearchParams(queryStart === -1 ? "" : url.slice(queryStart + 1));

    if (req.method === "GET" && pathname === "/tasks") {
      return listTasks(req, res, query);
    }
    if (req.method === "POST" && pathname === "/tasks") {
      return createTask(req, res, body);
    }
    if (req.method === "POST" && pathname.startsWith("/tasks/")) {
      return completeTask(req, res, pathname.split("/")[2]);
    }
    if (req.method === "PATCH" && pathname.startsWith("/tasks/")) {
      return updateTaskTitle(req, res, pathname.split("/")[2], body);
    }
    if (req.method === "DELETE" && pathname.startsWith("/tasks/")) {
      return deleteTask(req, res, pathname.split("/")[2]);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end('{"error":"not found"}');
  });
});

server.listen(PORT, () => {
  logger.info("server.listening", { port: PORT });
});
