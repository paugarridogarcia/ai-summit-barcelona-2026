import { test } from "node:test";
import assert from "node:assert/strict";
import * as store from "./store.js";
import { updateTaskTitle } from "./handlers.js";

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
