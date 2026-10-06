#!/usr/bin/env python3
"""EVA STORE — ضغط الفيديوهات الموثّقة ورفعها داخل المتجر.

يقرأ data/video-map.json (قرار تدقيق audit_media.py)، يضغط كل فيديو إلى
public/videos/<slug>.mp4 (480p + حد معدل) ويثبّت حقل video في data/products.json.
يدعو الفيديوهات العشوائية (المحتوى العام / الزائدة) خارج الخريطة = خارج المتجر.
مكتوب ليعيد التنفيذ بأمان: الملفات المكتملة تُتخطى.
"""
import io
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DATA = os.path.join(REPO, "data")
PUB = os.path.join(REPO, "artifacts", "eva-fabrics-store", "public")
VIDEOS = os.path.join(PUB, "videos")
PRODUCTS_JSON = os.path.join(DATA, "products.json")
MAP_JSON = os.path.join(DATA, "video-map.json")

FFMPEG = os.environ.get("FFMPEG") or r"C:\Users\ali\AppData\Local\Temp\opencode\ffmpeg\ffmpeg-9.0.2-essentials_build\bin\ffmpeg.exe"
VF = "scale='if(gt(iw,ih),-2,480)':'if(gt(iw,ih),480,-2)'"
ARGS = [
    "-y", "-hide_banner", "-loglevel", "error", "-i", "{src}",
    "-vf", VF,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "31",
    "-maxrate", "700k", "-bufsize", "1400k", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "48k", "-ar", "44100",
    "-movflags", "+faststart", "-sn",
    "{dst}",
]
ORPHANS = ["harvard-viscose.mp4", "harvard-poster.jpg"]


def encode(slug: str, src: str) -> dict:
    dst = os.path.join(VIDEOS, f"{slug}.mp4")
    if os.path.isfile(dst) and os.path.getsize(dst) > 10_000:
        return {"slug": slug, "status": "cached", "out_mb": round(os.path.getsize(dst) / 1048576, 2)}
    tmp = dst + ".tmp.mp4"
    cmd = [FFMPEG] + [part.format(src=src, dst=tmp) for part in ARGS]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=600, encoding="utf-8", errors="replace")
    except subprocess.TimeoutExpired:
        return {"slug": slug, "status": "timeout", "error": "ffmpeg timeout"}
    if proc.returncode != 0 or not os.path.isfile(tmp) or os.path.getsize(tmp) < 10_000:
        if os.path.isfile(tmp):
            os.remove(tmp)
        tail = (proc.stderr or "").strip().splitlines()[-3:]
        return {"slug": slug, "status": "failed", "error": " | ".join(tail)}
    os.replace(tmp, dst)
    return {"slug": slug, "status": "ok", "out_mb": round(os.path.getsize(dst) / 1048576, 2)}


def main() -> None:
    if not os.path.isfile(FFMPEG):
        sys.exit(f"ffmpeg not found: {FFMPEG}")
    os.makedirs(VIDEOS, exist_ok=True)
    for name in ORPHANS:
        path = os.path.join(VIDEOS, name)
        if os.path.isfile(path):
            os.remove(path)
            print("deleted orphan:", name)

    video_map = json.load(open(MAP_JSON, encoding="utf-8"))
    products = json.load(open(PRODUCTS_JSON, encoding="utf-8"))

    results = []
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(encode, slug, meta["src"]): slug for slug, meta in video_map.items()}
        done = 0
        for fut in as_completed(futures):
            res = fut.result()
            results.append(res)
            done += 1
            print(f"[{done}/{len(video_map)}] {res['slug']}: {res['status']}"
                  + (f" {res.get('out_mb', '')}MB" if res.get("out_mb") else "")
                  + (f" ERR {res.get('error', '')}" if res["status"] in ("failed", "timeout") else ""),
                  flush=True)

    ok = {r["slug"] for r in results if r["status"] in ("ok", "cached")}
    attached = 0
    for product in products:
        if product["slug"] in ok:
            if product.get("video") != f"videos/{product['slug']}.mp4":
                product["video"] = f"videos/{product['slug']}.mp4"
                attached += 1
        elif "video" in product:
            product.pop("video")
    json.dump(products, open(PRODUCTS_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    raw_total = sum(meta["size_mb"] for slug, meta in video_map.items() if slug in ok)
    out_total = sum(r.get("out_mb", 0) for r in results if r["status"] in ("ok", "cached"))
    failed = [r for r in results if r["status"] in ("failed", "timeout")]

    L = ["# تقرير رفع الفيديوهات", "",
         f"- فيديوهات موثّقة في الخريطة: **{len(video_map)}**",
         f"- نجح/مكتمل: **{len(ok)}** · فشل: **{len(failed)}**",
         f"- الحجم الخام: **{raw_total:.0f} م.ب** → بعد الضغط: **{out_total:.1f} م.ب** ({(out_total / raw_total * 100) if raw_total else 0:.0f}%)",
         f"- حقول video مثبتة في products.json: **{attached}** (الإجمالي الآن {sum(1 for p in products if p.get('video'))})",
         "- المستبعد عمداً: 27 فيديو محتوى عام + أي ملف خارج الميتا (لا يوجد) + الفيديو القديم harvard-viscose.",
         "", "## الملفات", "", "| slug | خام م.ب | مضغوط م.ب | الحالة |", "|------|---------|-----------|--------|"]
    by_slug_raw = {s: m["size_mb"] for s, m in video_map.items()}
    for r in sorted(results, key=lambda x: x["slug"]):
        L.append(f"| {r['slug']} | {by_slug_raw.get(r['slug'], '—')} | {r.get('out_mb', '—')} | {r['status']} |")
    if failed:
        L += ["", "## فشل", ""]
        for r in failed:
            L.append(f"- `{r['slug']}`: {r.get('error', '')}")
    open(os.path.join(DATA, "video-report.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")

    print(json.dumps({
        "mapped": len(video_map),
        "ok": len(ok),
        "failed": len(failed),
        "raw_mb": round(raw_total, 1),
        "out_mb": round(out_total, 1),
        "attached_fields": attached,
        "products_with_video": sum(1 for p in products if p.get("video")),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
