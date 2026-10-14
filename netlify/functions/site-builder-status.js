/* GET ?id=...  ->  { status: "pending" | "done" | "error", html?, error? } */
const { getStore, connectLambda } = require("@netlify/blobs");
const { CORS, authorized } = require("./lib/site-builder");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (!authorized(event)) return { statusCode: 401, headers: CORS, body: JSON.stringify({ status: "error", error: "Access key missing or wrong" }) };
  connectLambda(event);
  const id = String((event.queryStringParameters || {}).id || "");
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) return { statusCode: 400, headers: CORS, body: JSON.stringify({ status: "error", error: "bad id" }) };
  const job = await getStore("site-jobs").get(id, { type: "json" });
  return { statusCode: 200, headers: { ...CORS, "content-type": "application/json", "cache-control": "no-store" }, body: JSON.stringify(job || { status: "pending" }) };
};
