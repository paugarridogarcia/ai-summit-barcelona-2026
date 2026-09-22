import test from "node:test";
import assert from "node:assert/strict";
import { updateTask } from "./handlers.js";
import * as store from "./store.js";

function fakeRes() {
  const res = { status: 0, body: "" };
  res.writeHead = (status) => {
    res.status = status;
  };
  res.end = (body) => {
    res.body = body;
  };
  return res;
}

test("updates the title of an existing task", () => {
  const task = store.add("old title");
  const res = fakeRes();
  updateTask({}, res, String(task.id), JSON.stringify({ title: "new title" }));
  assert.equal(res.status, 200);
  assert.equal(JSON.parse(res.body).title, "new title");
  assert.equal(store.find(task.id).title, "new title");
});

test("returns 404 when the task does not exist", () => {
  const res = fakeRes();
  updateTask({}, res, "999999", JSON.stringify({ title: "anything" }));
  assert.equal(res.status, 404);
  assert.equal(JSON.parse(res.body).error, "task not found");
});

test("returns 400 when the body is not JSON", () => {
  const res = fakeRes();
  updateTask({}, res, "1", "not json");
  assert.equal(res.status, 400);
});

test("returns 400 when the title is missing or empty", () => {
  const missing = fakeRes();
  updateTask({}, missing, "1", JSON.stringify({}));
  assert.equal(missing.status, 400);

  const empty = fakeRes();
  updateTask({}, empty, "1", JSON.stringify({ title: "   " }));
  assert.equal(empty.status, 400);
});

test("returns 400 when the title is too long", () => {
  const res = fakeRes();
  updateTask({}, res, "1", JSON.stringify({ title: "x".repeat(141) }));
  assert.equal(res.status, 400);
  assert.equal(JSON.parse(res.body).error, "title too long");
});

test("does not change the store when validation fails", () => {
  const task = store.add("untouched");
  const res = fakeRes();
  updateTask({}, res, String(task.id), JSON.stringify({ title: "" }));
  assert.equal(res.status, 400);
  assert.equal(store.find(task.id).title, "untouched");
});
