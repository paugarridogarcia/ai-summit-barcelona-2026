import { test } from "node:test";
import assert from "node:assert/strict";
import * as store from "./store.js";
import { updateTaskTitle, deleteTask } from "./handlers.js";

function fakeRes() {
  return {
    status: 0,
    body: "",
    writeHead(status) {
      this.status = status;
    },
    end(body) {
      this.body = body;
    },
  };
}

const req = { headers: {} };

test("updates the title of an existing task", () => {
  const task = store.add("before");
  const res = fakeRes();

  updateTaskTitle(req, res, String(task.id), JSON.stringify({ title: "after" }));

  assert.equal(res.status, 200);
  assert.equal(JSON.parse(res.body).title, "after");
  assert.equal(store.find(task.id).title, "after");
});

test("rejects a title that is not a non-empty string", () => {
  const task = store.add("before");
  const res = fakeRes();

  updateTaskTitle(req, res, String(task.id), JSON.stringify({ title: "   " }));

  assert.equal(res.status, 400);
  assert.equal(JSON.parse(res.body).error.code, "invalid_title");
  assert.equal(store.find(task.id).title, "before");
});

test("rejects a title over the length limit", () => {
  const task = store.add("before");
  const res = fakeRes();

  updateTaskTitle(req, res, String(task.id), JSON.stringify({ title: "x".repeat(141) }));

  assert.equal(res.status, 400);
  assert.equal(JSON.parse(res.body).error.code, "title_too_long");
});

test("rejects a body that is not valid JSON", () => {
  const task = store.add("before");
  const res = fakeRes();

  updateTaskTitle(req, res, String(task.id), "not json");

  assert.equal(res.status, 400);
  assert.equal(JSON.parse(res.body).error.code, "invalid_json");
});

test("rejects an id that is not an integer", () => {
  const res = fakeRes();

  updateTaskTitle(req, res, "abc", JSON.stringify({ title: "after" }));

  assert.equal(res.status, 400);
  assert.equal(JSON.parse(res.body).error.code, "invalid_id");
});

test("returns 404 when the task does not exist", () => {
  const res = fakeRes();

  updateTaskTitle(req, res, "99999", JSON.stringify({ title: "after" }));

  assert.equal(res.status, 404);
  assert.equal(JSON.parse(res.body).error.code, "not_found");
});

test("deletes an existing task and returns 204 with no body", () => {
  const task = store.add("to delete");
  const res = fakeRes();

  deleteTask(req, res, String(task.id));

  assert.equal(res.status, 204);
  assert.equal(res.body, undefined);
  assert.equal(store.find(task.id), undefined);
});

test("delete rejects an id that is not an integer", () => {
  const res = fakeRes();

  deleteTask(req, res, "abc");

  assert.equal(res.status, 400);
  assert.equal(JSON.parse(res.body).error.code, "invalid_id");
});

test("delete rejects an id below one", () => {
  const res = fakeRes();

  deleteTask(req, res, "0");

  assert.equal(res.status, 400);
  assert.equal(JSON.parse(res.body).error.code, "invalid_id");
});

test("delete returns 404 when the task does not exist and removes nothing", () => {
  const before = store.all().length;
  const res = fakeRes();

  deleteTask(req, res, "99999");

  assert.equal(res.status, 404);
  assert.equal(JSON.parse(res.body).error.code, "not_found");
  assert.equal(store.all().length, before);
});
