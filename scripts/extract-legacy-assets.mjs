// One-off: pull the embedded photos out of the bundled design export (_legacy/index.html)
// and write them to public/images with readable names.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const lines = readFileSync(new URL("../_legacy/index.html", import.meta.url), "utf8").split("\n");
const manifest = JSON.parse(lines.find((l) => l.startsWith('{"') && l.includes('"mime"')));

const names = {
  "3f088627-9fff-4b99-831c-ae5edc350d7f": "logo.jpg",
  "82e05e34-3a3e-4c8f-b9e2-7cf20cca1af3": "hero.jpg",
  "d7d11e19-5a9e-4f0a-bffe-f3d4f1d2b9d6": "gallery-plates.jpg",
  "28c9a9c9-cb4f-4766-a178-376e909d0e00": "gallery-cardio.jpg",
  "fb451a06-6bdd-40c0-81ef-9b5ee859f0c4": "gallery-entrance.jpg",
  "1fd44f24-22ce-45e6-b98d-d370a59030e9": "gallery-lockers.jpg",
  "a2c866d4-3185-4454-aab1-5a595066c997": "gallery-rigs.jpg",
  "7a262bc1-c41e-43c4-9bc2-5eef76e510e7": "gallery-machines.jpg",
  "91a153f3-0111-4d81-a751-ca696a91fec6": "gallery-dumbbells.jpg",
  "75119db8-5f13-40b5-ae77-d5a84fd571eb": "promo-12months.jpg",
  "2104f577-4652-4633-ab04-a7997c06c40e": "promo-july.jpg",
  "c2c54bcc-445a-4b93-a257-a705e429ddb1": "promo-refer.jpg",
};

const outDir = new URL("../public/images/", import.meta.url);
mkdirSync(outDir, { recursive: true });
for (const [uuid, file] of Object.entries(names)) {
  const entry = manifest[uuid];
  if (!entry) throw new Error(`Missing asset ${uuid}`);
  writeFileSync(new URL(file, outDir), Buffer.from(entry.data, "base64"));
  console.log("wrote", file);
}
