import { test } from "node:test";
import assert from "node:assert/strict";
import { modelLabel } from "./model-label.ts";

test("a route id is shown as a model's name", () => {
  assert.equal(modelLabel("google/models/gemini-flash-latest"), "Gemini Flash");
  assert.equal(modelLabel("groq/llama-3.3-70b-versatile"), "Llama 3.3 70B");
  assert.equal(modelLabel("openrouter/mistralai/mistral-small-3.2-24b-instruct:free"), "Mistral Small 3.2 24B");
  assert.equal(modelLabel("gemini-2.5-flash-preview-05-20"), "Gemini 2.5 Flash");
  assert.equal(modelLabel("unknown"), "Unknown");
});
