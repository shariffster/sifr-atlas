"""Make the judge-facing source download from application source, never runtime state."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parent.parent
folders = ("app", "build", "components", "db", "docs", "hooks", "lib", "scripts", "vendor")
files = ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "tsconfig.json",
         "vite.config.ts", "next.config.ts", "postcss.config.mjs", "components.json",
         "cloudflare-env.d.ts", "eslint.config.mjs", "VERSION_HISTORY.md", "PRODUCT.md",
         "public/favicon.svg", ".openai/hosting.json", "RELEASE.md",
         "vendor/shadcn-tailwind-4.13.0.LICENSE.md", "build/sites-vite-plugin.LICENSE"]
paths = {root / name for name in files if (root / name).is_file()}
for folder in folders:
    paths.update(p for p in (root / folder).rglob("*")
                 if p.is_file() and not p.is_symlink()
                 and p.suffix in {".ts", ".tsx", ".js", ".mjs", ".css", ".json", ".sh", ".py", ".md"})
readme = (root / "docs/REVIEW-SOURCE.md").read_bytes()
manifest = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(paths)}
target = root / "public/sifr-makeathon-source.zip"
target.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    def add(name, content):
        item = zipfile.ZipInfo("sifr/" + name, (2026, 10, 11, 0, 0, 0))
        item.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(item, content)
    add("README.md", readme)
    add("SOURCE-MANIFEST.json", json.dumps(manifest, indent=2).encode())
    for p in sorted(paths):
        add(str(p.relative_to(root)), p.read_bytes())
print(f"Created {target.name}: {len(paths)} source files, {target.stat().st_size:,} bytes")
