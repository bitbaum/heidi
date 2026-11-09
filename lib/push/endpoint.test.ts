import { test } from "node:test";
import assert from "node:assert/strict";
import { isPushService } from "./endpoint.ts";

test("the endpoints browsers give are accepted", () => {
  for (const endpoint of [
    "https://fcm.googleapis.com/fcm/send/abc:def",
    "https://updates.push.services.mozilla.com/wpush/v2/gAAAA",
    "https://web.push.apple.com/QGx1",
    "https://wns2-par02p.notify.windows.com/w/?token=x",
  ]) {
    assert.equal(isPushService(endpoint), true, endpoint);
  }
});

test("anything else is refused: internal hosts, look-alikes, ports, credentials", () => {
  for (const endpoint of [
    "https://127.0.0.1/x",
    "https://169.254.169.254/latest/meta-data",
    "https://fcm.googleapis.com.evil.test/x",
    "https://evilfcm.googleapis.com/x",
    "https://fcm.googleapis.com:8443/x",
    "https://user:pw@fcm.googleapis.com/x",
    "http://fcm.googleapis.com/x",
    "not a url",
  ]) {
    assert.equal(isPushService(endpoint), false, endpoint);
  }
});
