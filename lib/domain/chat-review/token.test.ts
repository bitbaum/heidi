import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { checkReviewToken } from "./token.ts";

const req = (authorization?: string) =>
  new Request("http://localhost/api/chat/review-export", { headers: authorization ? { authorization } : {} });

describe("the review token", () => {
  test("an unset secret is 'unconfigured', whatever was presented", () => {
    assert.equal(checkReviewToken(req("Bearer anything"), undefined), "unconfigured");
    assert.equal(checkReviewToken(req("Bearer anything"), "   "), "unconfigured");
  });

  test("no header, a bare token and the wrong scheme are all refused", () => {
    assert.equal(checkReviewToken(req(), "s3cret"), "unauthorised");
    assert.equal(checkReviewToken(req("s3cret"), "s3cret"), "unauthorised");
    assert.equal(checkReviewToken(req("Basic s3cret"), "s3cret"), "unauthorised");
  });

  test("the wrong token is refused, including one of another length", () => {
    assert.equal(checkReviewToken(req("Bearer s3cre"), "s3cret"), "unauthorised");
    assert.equal(checkReviewToken(req("Bearer s3cret-and-more"), "s3cret"), "unauthorised");
    assert.equal(checkReviewToken(req("Bearer S3CRET"), "s3cret"), "unauthorised");
  });

  test("the right token is accepted, case-insensitive on the scheme only", () => {
    assert.equal(checkReviewToken(req("Bearer s3cret"), "s3cret"), "ok");
    assert.equal(checkReviewToken(req("bearer s3cret"), "s3cret"), "ok");
  });
});
