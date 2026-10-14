/* Shared helpers for the website builder (spec -> working site).
   Pure functions where possible so they can be tested without network. */

const MODEL = () => process.env.SITE_BUILDER_MODEL || "claude-opus-5-5";
const MAX_SPEC_CHARS = 60000;
const MAX_HTML_CHARS = 400000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SYSTEM = `You are a senior web designer and front-end engineer. You turn a website specification (JSON, usually in Hebrew) into ONE complete, polished, production-quality website.

Output rules (strict):
- Reply with a single self-contained HTML document and nothing else: start with <!doctype html>, end with </html>. No markdown fences, no commentary.
- All CSS and JavaScript inline. No build step, no frameworks. External resources only: Google Fonts stylesheets. Use inline SVG or CSS for graphics; never reference images that do not exist (use gradients, SVG, emoji-free neutral shapes).
- Implement EVERY page in the spec as a real view of the same file, using hash routing (#/path) with working navigation, active-link state, and scroll-to-top on change. Include a header, footer and a mobile menu.
- Honour the spec: site name, languages (RTL for Hebrew/Arabic with dir and lang set correctly; if several languages are listed add a working language switch for the key texts), brand tone, colors, fonts, page purposes and content, features, legal pages and integrations (render integrations as clearly marked placeholders, e.g. a contact form that validates and shows a success message, with a comment where to connect the real endpoint).
- Write real, specific copy in the spec's main language based on what the spec says. Never leave lorem ipsum or "TODO". If the spec is thin, make sensible, honest choices and keep claims modest (no invented prices, statistics, certifications or testimonials presented as real; health-related sites must not make medical claims).
- Quality bar: responsive from 360px up, semantic HTML, WCAG AA contrast, visible focus states, keyboard-operable menus, prefers-reduced-motion respected, meta title/description, Open Graph tags, fast (no heavy libraries).
- Visual design should feel custom and premium: a considered type scale, generous spacing, consistent components, subtle motion. Do not produce a generic template look.
- When asked to MODIFY an existing site, return the full updated document, changing only what was requested and preserving everything else.`;

function buildMessages({ spec, instruction, html }) {
  const specText = JSON.stringify(spec || {}, null, 1).slice(0, MAX_SPEC_CHARS);
  if (html && instruction) {
    return [{
      role: "user",
      content:
        "Website specification:\n" + specText +
        "\n\nCurrent site HTML:\n" + String(html).slice(0, MAX_HTML_CHARS) +
        "\n\nRequested change:\n" + String(instruction).slice(0, 4000) +
        "\n\nReturn the full updated HTML document.",
    }];
  }
  return [{
    role: "user",
    content: "Website specification:\n" + specText +
      (instruction ? "\n\nExtra instructions from the client:\n" + String(instruction).slice(0, 4000) : "") +
      "\n\nBuild the complete website now.",
  }];
}

/* models sometimes wrap output in fences or add a sentence; keep only the document */
function extractHtml(text) {
  let t = String(text || "").trim();
  const fence = t.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence && /<html|<!doctype/i.test(fence[1])) t = fence[1].trim();
  const start = t.search(/<!doctype html|<html/i);
  if (start > 0) t = t.slice(start);
  const end = t.toLowerCase().lastIndexOf("</html>");
  if (end > -1) t = t.slice(0, end + 7);
  if (!/<html|<!doctype/i.test(t) || !/<\/html>/i.test(t)) return null;
  return t;
}

async function callClaude({ spec, instruction, html }, fetchImpl) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set in Netlify (Site settings → Environment variables)");
  const res = await (fetchImpl || fetch)("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL(), max_tokens: 32000, system: SYSTEM, messages: buildMessages({ spec, instruction, html }) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error("Anthropic API " + res.status + ": " + ((data.error && data.error.message) || "request failed"));
  const text = (data.content || []).map((b) => b.text || "").join("");
  const out = extractHtml(text);
  if (!out) throw new Error(data.stop_reason === "max_tokens" ? "The site was too large to finish — try a smaller spec or ask for fewer pages" : "The model did not return a valid HTML document");
  return out;
}

/* optional shared secret so strangers cannot spend the API key.
   Sent in the body (POST) or query string (GET), not a header, so the browser
   can call us cross-origin without a CORS preflight (background functions
   cannot answer one). */
function authorized(event, body) {
  const need = process.env.SITE_BUILDER_KEY;
  if (!need) return true;
  const q = event.queryStringParameters || {};
  return (body && body.key) === need || q.key === need;
}

module.exports = { CORS, SYSTEM, buildMessages, extractHtml, callClaude, authorized };
