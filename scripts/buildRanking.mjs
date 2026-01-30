import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const PREFIX = "eu.rising-gods.";
const BASE = "https://db.rising-gods.de/?profile=";

function parseFromMetaDescription(html) {
  // meta description example:
  // content="Nellybly: Level 4 Untoter Priester von Rising-Gods."
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (!m) return null;

  const desc = m[1];

  // Capture: Level number, race, class (class may be 1-2 words)
  const m2 = desc.match(/:\s*Level\s+(\d{1,3})\s+([A-Za-zÄÖÜäöüß-]+)\s+([A-Za-zÄÖÜäöüß-]+(?:\s+[A-Za-zÄÖÜäöüß-]+)?)\b/i);
  if (!m2) return null;

  return { level: Number(m2[1]), race: m2[2], cls: m2[3] };
}

async function main() {
  const repoRoot = process.cwd();
  const charsPath = path.join(repoRoot, "chars.txt");
  const outPath = path.join(repoRoot, "public", "ranking.json");

  const raw = await fs.readFile(charsPath, "utf-8");
  const names = raw
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith("#"));

  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0",
    locale: "de-DE",
  });

  const results = [];

  for (const name of names) {
    const profileFull = PREFIX + name;
    const url = BASE + encodeURIComponent(profileFull);

    try {
      // Real browser navigation (passes more anti-bot checks than plain fetch)
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      const status = resp?.status() ?? 0;

      const html = await page.content();
      const parsed = parseFromMetaDescription(html);
      if (!parsed) throw new Error(`Parse failed (HTTP ${status})`);

      results.push({
        name,
        level: parsed.level,
        race: parsed.race,
        class: parsed.cls,
        url,
      });
    } catch (e) {
      results.push({ name, url, error: String(e?.message || e) });
    }
  }

  await browser.close();

  const ok = results.filter(r => !r.error);
  ok.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));

  const payload = {
    generatedAt: new Date().toISOString(),
    total: results.length,
    ok: ok.length,
    failed: results.length - ok.length,
    data: ok,
    errors: results.filter(r => r.error),
  };

  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`Wrote public/ranking.json (${payload.ok} ok, ${payload.failed} failed)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
