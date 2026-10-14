/* ============================================================
   Netlify BACKGROUND function — build or edit a website from a spec.
   Background functions may run up to 15 minutes (a normal function is
   cut off after ~10-26s, too short for generating a whole site), and
   return 202 immediately. The result is written to Netlify Blobs and
   read by site-builder-status.js.

   POST { id, key?, spec, instruction?, html? }  (sent as text/plain to avoid a CORS preflight)
   Env: ANTHROPIC_API_KEY (required), SITE_BUILDER_KEY (optional access key),
        SITE_BUILDER_MODEL (optional, default claude-opus-5-5)
   ============================================================ */
const { getStore, connectLambda } = require("@netlify/blobs");
const { callClaude, authorized } = require("./lib/site-builder");

exports.handler = async (event) => {
  connectLambda(event);
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "" };
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (e) { return { statusCode: 400, body: "" }; }
  if (!authorized(event, body)) return { statusCode: 401, body: "" };
  const id = String(body.id || "");
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) return { statusCode: 400, body: "" };
  const store = getStore("site-jobs");
  await store.setJSON(id, { status: "pending", at: Date.now() });
  try {
    const html = await callClaude({ spec: body.spec, instruction: body.instruction, html: body.html });
    await store.setJSON(id, { status: "done", html, at: Date.now() });
  } catch (e) {
    await store.setJSON(id, { status: "error", error: String(e.message || e), at: Date.now() });
  }
  return { statusCode: 202, body: "" };
};
