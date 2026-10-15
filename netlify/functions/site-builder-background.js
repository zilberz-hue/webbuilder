/* ============================================================
   Netlify BACKGROUND function — build or edit a website from a spec.
   Background functions may run up to 15 minutes (a normal function is
   cut off after ~10-26s, too short for generating a whole site), and
   return 202 immediately. The result is written to Netlify Blobs and
   read by site-builder-status.js.

   POST { id, sid?, key?, spec, instruction?, html? }  (sent as text/plain to avoid a CORS preflight)
   Env: ANTHROPIC_API_KEY (required), SITE_BUILDER_KEY (optional access key),
        SITE_BUILDER_MODEL (optional, default claude-opus-5-5)
   ============================================================ */
const { getStore, connectLambda } = require("@netlify/blobs");
const { callClaude, authorized, parseDataUrl } = require("./lib/site-builder");

const ID = /^[A-Za-z0-9_-]{6,64}$/;
const MAX_ASSETS = 12;

/* uploaded files were stored by site-assets.js under <sid>/<assetId> */
async function loadAssets(sid, meta) {
  if (!ID.test(String(sid || "")) || !Array.isArray(meta)) return [];
  const store = getStore("site-assets");
  const out = [];
  for (const a of meta.slice(0, MAX_ASSETS)) {
    if (!a || !ID.test(String(a.id || ""))) continue;
    const url = await store.get(sid + "/" + a.id);
    const p = parseDataUrl(url);
    if (!p) continue;
    out.push({ id: a.id, name: String(a.name || "").slice(0, 120), role: String(a.role || "").slice(0, 60), note: String(a.note || "").slice(0, 500), mime: p.mime, b64: p.b64 });
  }
  return out;
}

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
    const assets = await loadAssets(body.sid, (body.spec || {}).assets);
    const html = await callClaude({ spec: body.spec, instruction: body.instruction, html: body.html, assets });
    await store.setJSON(id, { status: "done", html, at: Date.now() });
  } catch (e) {
    await store.setJSON(id, { status: "error", error: String(e.message || e), at: Date.now() });
  }
  return { statusCode: 202, body: "" };
};
