/* POST (text/plain JSON) { key?, sid, id, dataUrl } -> stores one uploaded file in Netlify Blobs
   under <sid>/<id> so the background builder can read it (the background function's own
   request body is too small for images). Sent as text/plain so no CORS preflight is needed. */
const { getStore, connectLambda } = require("@netlify/blobs");
const { CORS, authorized, parseDataUrl } = require("./lib/site-builder");

const ID = /^[A-Za-z0-9_-]{6,64}$/;
const OK_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "application/pdf", "text/plain", "text/markdown"];
const MAX_CHARS = 4.8 * 1024 * 1024; /* data-URL length; Netlify's request limit is ~6MB */

const reply = (code, obj) => ({ statusCode: code, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return reply(405, { ok: false });
  connectLambda(event);
  let b;
  try { b = JSON.parse(event.body || "{}"); } catch (e) { return reply(400, { ok: false, error: "bad json" }); }
  if (!authorized(event, b)) return reply(401, { ok: false, error: "Access key missing or wrong" });
  if (!ID.test(String(b.sid || "")) || !ID.test(String(b.id || ""))) return reply(400, { ok: false, error: "bad id" });
  const url = String(b.dataUrl || "");
  if (url.length > MAX_CHARS) return reply(413, { ok: false, error: "file too large" });
  const p = parseDataUrl(url);
  if (!p || OK_MIME.indexOf(p.mime) < 0) return reply(400, { ok: false, error: "unsupported file" });
  await getStore("site-assets").set(b.sid + "/" + b.id, url);
  return reply(200, { ok: true });
};
