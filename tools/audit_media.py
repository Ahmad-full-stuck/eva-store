#!/usr/bin/env python3
"""EVA STORE — تدقيق الوسائط: الصور والفيديو قبل الرفع.

يقرأ كروت الرفع CSV + كل مجلد في الاستخراج، ويتحقق:
  1) تصنيف كل مجلد (منتج / ستايل / محتوى عام) — بين الكارت والميتا واسم الدلو.
  2) ملكية الصور (ملفات صور/ مقابل ملفات_الصور في الميتا).
  3) الفيديوهات: هل هو من ممتلكات المنشور؟ هل للترانسكربت وجود؟ هل يذكر الاسم؟
  4) الفيديوهات العشوائية (محتوى عام + ملفات زائدة) — تُستبعد.

يكتب:
  data/video-map.json   — قرار الرفع: slug -> مسار المصدر والتحقق
  data/media-audit.md   — تقرير عربي كامل
"""
import csv
import io
import json
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
EXTRACT = r"C:\Users\ali\Desktop\EVA STORE - استخراج"
INDEX = os.path.join(EXTRACT, "00_الفهرس_الشامل")
CARDS = os.path.join(INDEX, "06_بطاقات_الرفع.csv")
DATA = os.path.join(REPO, "data")
PRODUCTS_JSON = os.path.join(DATA, "products.json")
PUB = os.path.join(REPO, "artifacts", "eva-fabrics-store", "public")

sys.path.insert(0, HERE)
from import_products import ascii_slug  # noqa: E402


def norm(value: str) -> str:
    value = (value or "").lower()
    value = re.sub(r"[ً-ْٰ]", "", value)
    value = value.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    value = value.replace("ى", "ي").replace("ة", "ه").replace("ؤ", "و").replace("ئ", "ي")
    return re.sub(r"\s+", " ", value).strip()


def read_text(path: str) -> str:
    try:
        return open(path, encoding="utf-8", errors="replace").read()
    except OSError:
        return ""


def folder_files(folder: str, subdir: str) -> list[str]:
    path = os.path.join(folder, subdir)
    if not os.path.isdir(path):
        return []
    return sorted(os.path.join(path, f) for f in os.listdir(path) if os.path.isfile(os.path.join(path, f)))


def name_tokens(name: str) -> list[str]:
    tokens = []
    for raw in re.split(r"[^\w\u0600-\u06FF]+", name, flags=re.UNICODE):
        t = norm(raw)
        if len(t) >= 4:
            tokens.append(t)
    return tokens


def main() -> None:
    rows = list(csv.DictReader(open(CARDS, encoding="utf-8-sig")))
    products = json.load(open(PRODUCTS_JSON, encoding="utf-8"))
    products_by_slug = {p["slug"]: p for p in products}

    used_slugs: set[str] = set()
    entries: list[dict] = []
    general_entries: list[dict] = []

    for order, row in enumerate(rows, start=1):
        kind = (row.get("التصنيف") or "").strip()
        if kind.startswith("محتوى عام"):
            bucket = "عام"
        elif kind.startswith("فيديو ستايلات"):
            bucket = "ستايل"
        elif kind.startswith("منتج"):
            bucket = "منتج"
        else:
            bucket = "غير معروف"

        rel = (row.get("المجلد") or "").strip().replace("\\", "/")
        folder = os.path.join(EXTRACT, *rel.split("/")) if rel else ""
        name = (row.get("اسم_المتجر") or "").strip()
        if not name or not folder:
            continue

        meta = {}
        meta_path = os.path.join(folder, "بيانات_المتجر.json")
        if os.path.isfile(meta_path):
            try:
                meta = json.load(open(meta_path, encoding="utf-8"))
            except Exception:
                meta = {}

        meta_kind = str(meta.get("التصنيف") or "")
        if bucket == "غير معروف":
            if meta_kind.startswith("ستايل"):
                bucket = "ستايل"
            elif meta_kind.startswith("محتوى عام"):
                bucket = "عام"
            elif meta_kind.startswith("منتج"):
                bucket = "منتج"

        # slug — نفس منطق الاستيراد (المحتوى العام يُستبعد قبل الترقيم)
        slug = ""
        if bucket != "عام":
            slug = ascii_slug(name) or f"item-{order:03d}"
            base, suffix = slug, 2
            while slug in used_slugs:
                slug = f"{base}-{suffix}"
                suffix += 1
            used_slugs.add(slug)

        # ملكية الصور
        images = folder_files(folder, "صور")
        image_names = {os.path.basename(p) for p in images}
        meta_images = set(meta.get("ملفات_الصور") or [])
        images_declared_ok = (not meta_images) or (meta_images <= image_names)

        # الفيديو
        videos = folder_files(folder, "فيديو")
        video_names = [os.path.basename(p) for p in videos]
        meta_videos = list(meta.get("ملفات_الفيديو") or [])
        declared = [v for v in video_names if v in set(meta_videos)]
        orphan = [v for v in video_names if v not in set(meta_videos)]

        transcript_text = ""
        transcript_file = ""
        for fname in sorted(os.listdir(folder)) if os.path.isdir(folder) else []:
            if fname.endswith(("_transcript_plain.txt", "_transcript.txt")):
                transcript_file = fname
                transcript_text = read_text(os.path.join(folder, fname))
                if fname.endswith("_plain.txt"):
                    break
        norm_text = norm(transcript_text)
        tokens = name_tokens(name)
        name_in_text = any(t in norm_text for t in tokens) if tokens else False
        name_latin_hit = bool(re.search(re.escape(name), transcript_text, re.I)) if name.isascii() else False

        # مطابقة الدلو (اسم المجلد الظاهر في المسار)
        path_bucket = "عام" if rel.startswith("03_") else ("ستايل" if rel.startswith("01_") else ("منتج" if rel.startswith("02_") else "?"))
        bucket_match = (path_bucket == bucket) or bucket == "غير معروف"

        # قرار الرفع
        video_decision = "لا يوجد فيديو"
        primary = ""
        if bucket in ("منتج", "ستايل"):
            if declared:
                primary = declared[0]
                if transcript_text:
                    video_decision = "يرفع (منشور موثّق بالترانسكربت)"
                else:
                    video_decision = "يرفع (ملف موثّق لكن بلا ترانسكربت)"
            elif videos:
                video_decision = "مستبعد (فيديو غير معلن في الميتا — عشوائي)"
            else:
                video_decision = "لا يوجد فيديو"
        elif bucket == "عام":
            video_decision = f"مستبعد (محتوى عام) — {len(videos)} فيديو" if videos else "مستبعد (محتوى عام)"

        entry = {
            "order": order,
            "bucket": bucket,
            "slug": slug,
            "name": name,
            "folder": folder,
            "rel": rel,
            "kind_csv": kind,
            "kind_meta": meta_kind,
            "bucket_match": bucket_match,
            "images": len(images),
            "images_declared_ok": images_declared_ok,
            "videos": video_names,
            "videos_declared": meta_videos,
            "videos_orphan": orphan,
            "primary_video": primary,
            "primary_size_mb": round(os.path.getsize(os.path.join(folder, "فيديو", primary)) / 1048576, 1) if primary else 0,
            "transcript": bool(transcript_text),
            "transcript_file": transcript_file,
            "name_in_text": name_in_text or name_latin_hit,
            "name_tokens": tokens,
            "decision": video_decision,
            "in_store": slug in products_by_slug if slug else False,
        }
        (general_entries if bucket == "عام" else entries).append(entry)

    # ————— مطابقة مع المتجر —————
    store_slugs = set(products_by_slug)
    audit_slugs = {e["slug"] for e in entries}
    missing_in_store = sorted(audit_slugs - store_slugs)
    missing_in_audit = sorted(store_slugs - audit_slugs)

    video_map = {}
    for e in entries:
        if e["slug"] and e["primary_video"] and "يرفع" in e["decision"]:
            video_map[e["slug"]] = {
                "src": os.path.join(e["folder"], "فيديو", e["primary_video"]),
                "bucket": e["bucket"],
                "size_mb": e["primary_size_mb"],
                "transcript": e["transcript"],
                "name_in_text": e["name_in_text"],
            }

    # صور المتجر: كل منتج فعلية على القرص؟
    missing_image_files = [
        p["slug"] for p in products
        if not os.path.isfile(os.path.join(PUB, p["image"]))
    ]

    os.makedirs(DATA, exist_ok=True)
    json.dump(video_map, open(os.path.join(DATA, "video-map.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ————— التقرير —————
    products_e = [e for e in entries if e["bucket"] == "منتج"]
    styles_e = [e for e in entries if e["bucket"] == "ستايل"]
    unknown_e = [e for e in entries if e["bucket"] == "غير معروف"]
    gen_videos = sum(len(e["videos"]) for e in general_entries)
    orphan_videos = sum(len(e["videos_orphan"]) for e in entries)
    mismatch = [e for e in entries + general_entries if not e["bucket_match"]]
    no_transcript = [e for e in entries if not e["transcript"]]
    name_miss = [e for e in entries if not e["name_in_text"]]
    uploadable = [e for e in entries if "يرفع" in e["decision"]]
    raw_mb = sum(e["primary_size_mb"] for e in uploadable)

    L: list[str] = [
        "# تدقيق الوسائط — صور وفيديوهات إيفا ستور",
        "",
        "## الملخص",
        "",
        f"- صفوف الكارت: **{len(rows)}** → منتجات **{len(products_e)}** · ستايلات **{len(styles_e)}** · محتوى عام **{len(general_entries)}** · غير معروف **{len(unknown_e)}**",
        f"- فيديوهات في الاستخراج: **{gen_videos + sum(len(e['videos']) for e in entries)}** (عامة مستبعدة: {gen_videos} + زائدة غير معلنة: {orphan_videos})",
        f"- فيديو جاهز للرفع: **{len(video_map)}** من **{len(entries)}** مجلد منتج/ستايل — الحجم الخام **{raw_mb:.0f} م.ب**",
        f"- بلا ترانسكربت: **{len(no_transcript)}** · اسم المنتج غير مذكور نصياً في الترانسكربت: **{len(name_miss)}** (المطابقة اختيارية — المجلد = المنشور = المنتج)",
        f"- اختلاف تصنيف بين مسار الدلو والكارت: **{len(mismatch)}**",
        f"- منتجات في المتجر بلا صور على القرص: **{len(missing_image_files)}**",
        "",
        "### تطابق الكارت مع المتجر",
        "",
        f"- سلاغات مدورة غير موجودة في products.json: **{len(missing_in_store)}**" + (f" — {missing_in_store}" if missing_in_store else ""),
        f"- سلاغات في products.json بلا صف كارت: **{len(missing_in_audit)}**" + (f" — {missing_in_audit}" if missing_in_audit else ""),
        "",
        "## قرار الرفع (slug ← الفيديو)",
        "",
        "| # | النوع | slug | فيديو | حجم خام | ترانسكربت | الاسم في النص | القرار |",
        "|---|-------|------|-------|---------|-----------|--------------|--------|",
    ]
    for e in entries:
        L.append(
            f"| {e['order']} | {e['bucket']} | `{e['slug']}` | {e['primary_video'] or '—'} | "
            f"{e['primary_size_mb'] or '—'} | {'✔' if e['transcript'] else '—'} | "
            f"{'✔' if e['name_in_text'] else '—'} | {e['decision']} |"
        )

    if unknown_e:
        L += ["", "## صفوف غير معروفة التصنيف", ""]
        for e in unknown_e:
            L.append(f"- `{e['name']}` (CSV: {e['kind_csv']} | ميتا: {e['kind_meta']}) → {e['decision']}")

    L += ["", "## المحتوى العام (30 مجلداً — مستبعد كلياً من المتجر)", "",
          "| # | الاسم | صور | فيديوهات |", "|---|-------|-----|----------|"]
    for e in general_entries:
        L.append(f"| {e['order']} | {e['name']} | {e['images']} | {len(e['videos'])} |")

    L += ["", "## ملاحظات", "",
          "- المجلد في الاستخراج = منشور إنستغرام واحد = منتج/ستايل واحد (كود المنشور في الميتا).",
          "- الفيديو «عشوائي» = ملف خارج `ملفات_الفيديو` المعلنة أو من دلو محتوى عام — لا يُرفع.",
          f"- الصور: {sum(e['images'] for e in entries)} صورة داخل مجلدات المنتجات والستايلات، "
          f"{sum(e['images'] for e in general_entries)} صورة محتوى عام (غير مستوردة).",
          "- الترانسكربت دليل تحقق ثانوي؛ المطابقة النصية للاسم صوتية (التسجيلات لهجية) وليست شرط رفع.",
          ""]
    report_path = os.path.join(DATA, "media-audit.md")
    open(report_path, "w", encoding="utf-8").write("\n".join(L))

    print(json.dumps({
        "rows": len(rows),
        "products": len(products_e),
        "styles": len(styles_e),
        "general": len(general_entries),
        "unknown": len(unknown_e),
        "uploadable_videos": len(video_map),
        "raw_mb": round(raw_mb, 1),
        "orphan_videos_excluded": orphan_videos,
        "general_videos_excluded": gen_videos,
        "bucket_mismatches": len(mismatch),
        "missing_in_store": missing_in_store,
        "missing_in_audit": missing_in_audit,
        "store_missing_images": missing_image_files,
        "report": report_path,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
