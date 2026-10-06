#!/usr/bin/env python3
"""EVA STORE — build the real catalogue from the extraction folders.

Reads  C:\\Users\\ali\\Desktop\\EVA STORE - استخراج\\00_الفهرس_الشامل\\06_بطاقات_الرفع.csv
       + every product folder (بيانات_المتجر.json / صور / فيديو)

Writes artifacts/eva-fabrics-store/public/products/<slug>/   (jpg + webp 320/640/1024)
       data/products.json
       data/categories.json
       data/import-report.md
"""
import csv
import json
import os
import re
import sys
import unicodedata
from collections import Counter

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
EXTRACT = r"C:\Users\ali\Desktop\EVA STORE - استخراج"
INDEX = os.path.join(EXTRACT, "00_الفهرس_الشامل")
CARDS = os.path.join(INDEX, "06_بطاقات_الرفع.csv")
PUB = os.path.join(REPO, "artifacts", "eva-fabrics-store", "public")
PRODUCTS_DIR = os.path.join(PUB, "products")
DATA_DIR = os.path.join(REPO, "data")
WIDTHS = (320, 640, 1024)

AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")

TRANSLIT = {
    "ا": "a", "أ": "a", "إ": "a", "آ": "a", "ب": "b", "ت": "t", "ث": "th",
    "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z",
    "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z", "ع": "a",
    "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
    "ه": "h", "ة": "h", "و": "w", "ي": "y", "ى": "a", "ئ": "e", "ؤ": "o",
    "ء": "", "لا": "la", "لأ": "la", "لإ": "la", "لآ": "la",
    "پ": "p", "چ": "ch", "ژ": "zh", "گ": "g",
}

COLOR_HEX = {
    "أسود": "#1c1c1c", "اسود": "#1c1c1c", "أبيض": "#f4f1ea", "ابيض": "#f4f1ea",
    "كحلي": "#2a3654", "نيلي": "#2b3a67", "أزرق": "#3a6ea5", "ازرق": "#3a6ea5",
    "سماوي": "#8ec5e6", "لبني": "#cfe0ee", "أخضر": "#3f7d5a", "اخضر": "#3f7d5a",
    "زيتوني": "#5d6b39", "تركوازي": "#3fa8a0", "بني": "#6b4a2f", "كستنائي": "#6b3410",
    "بيج": "#d8c7a7", "سكري": "#e7d9b8", "عاجي": "#efe6d6", "كريمي": "#efe6d6",
    "رمادي": "#8a8a8a", "فضي": "#c8ccd0", "وردي": "#d78ba0", "فوشي": "#c74b8a",
    "أحمر": "#a52a2a", "احمر": "#a52a2a", "عنابي": "#7b1e2b", "خمري": "#6d2130",
    "أصفر": "#e0b53f", "اصفر": "#e0b53f", "ذهبي": "#c9a227", "برتقالي": "#d97b2b",
    "ليلكي": "#9b8ec4", "بنفسجي": "#7b5aa6", "بترولي": "#124f4f", "فحمي": "#333333",
    "بترولى": "#124f4f", "توتي": "#8c2f39", "زهري": "#e0a1b3", "هبي": "#d7a86e",
    "فستقي": "#c9a66b", "زيتي": "#6f7440",
}

COLOR_WORDS = sorted(COLOR_HEX, key=len, reverse=True)

STRETCH_WORDS = ("سباندكس", "سبانكس", "مطاطي", "ليكرا", "استرتش", "اسبانكس", "اسپاندکس")
SEQUIN_WORDS = ("ترتر", "لمّاع", "لامع", "ساتان", "هولو", "سلك", "ديجتال", "ميتالك", "ميتلك", "غليتر", "لمعة", "بريق")
EMBROIDER_WORDS = ("أمبرودري", "امبرودري", "أمبرودري", "مطرز", "تطريز", "تطرز", "امبودري", "بوردر")
PATTERN_WORDS = ("جاكار", "جوزي", "دوباتا", "مطبوع", "نقش", "منقوش", "بروكارد", "نمنم", "مزخرف")

WEIGHT_WORDS_LIGHT = ("خفيف", "ناعم", "انسيابي", "انسيابيه", "حرير", "كريب")
WEIGHT_WORDS_HEAVY = ("ثقيل", "شتوي", "شتاء", "سميك", "تويل", "توييد", "بوكلي", "بطانة")

NAMED_PALETTE = [
    ("أسود", "#1c1c1c"), ("فحمي", "#333333"), ("رمادي", "#8a8a8a"), ("فضي", "#c8ccd0"),
    ("أبيض", "#f4f1ea"), ("عاجي", "#efe6d6"), ("بيج", "#d8c7a7"), ("كريمي", "#e6dcc6"),
    ("سكري", "#e7d9b8"), ("كحلي", "#2a3654"), ("نيلي", "#2b3a67"), ("أزرق", "#3a6ea5"),
    ("سماوي", "#8ec5e6"), ("لبني", "#cfe0ee"), ("أخضر", "#3f7d5a"), ("زيتي", "#6f7440"),
    ("زيتوني", "#5d6b39"), ("تركوازي", "#3fa8a0"), ("بني", "#6b4a2f"), ("كستنائي", "#6b3410"),
    ("وردي", "#d78ba0"), ("زهري", "#e0a1b3"), ("فوشي", "#c74b8a"), ("أحمر", "#a52a2a"),
    ("عنابي", "#7b1e2b"), ("خمري", "#6d2130"), ("أصفر", "#e0b53f"), ("ذهبي", "#c9a227"),
    ("برتقالي", "#d97b2b"), ("ليلكي", "#9b8ec4"), ("بنفسجي", "#7b5aa6"), ("بترولي", "#124f4f"),
    ("توتي", "#8c2f39"), ("فستقي", "#c9a66b"),
]


def num(value: str) -> str:
    return (value or "").translate(AR_DIGITS)


def ascii_slug(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "").lower()
    out = []
    i = 0
    while i < len(value):
        ch = value[i]
        if ch in ("ل",) and i + 1 < len(value) and value[i + 1] in ("ا", "أ", "إ", "آ"):
            out.append("la")
            i += 2
            continue
        if ch in TRANSLIT:
            out.append(TRANSLIT[ch])
        elif ch.isascii() and ch.isalnum():
            out.append(ch)
        i += 1
    slug = re.sub(r"[^a-z0-9]+", "-", "".join(out)).strip("-")
    return re.sub(r"-{2,}", "-", slug)


def parse_price(field: str, *texts: str) -> tuple[int, str]:
    """Priority: the extracted السعر column, then captions / transcripts / description."""
    candidates: list[tuple[str, bool]] = []
    if field and field.strip():
        candidates.append((field, True))
    for text in texts:
        if text and text.strip():
            candidates.append((text, False))

    for raw, allow_leading in candidates:
        text = num(raw)
        # 1) explicit "سعر المتر ..." / "سعر متر N"
        match = re.search(r"سعر\s*(?:ال)?متر\s*[:\-]?\s*(?:ب)?\s*(\d{1,6})", text)
        if match:
            n = int(match.group(1))
            tail = text[match.end():match.end() + 8]
            if n > 300:
                if n >= 1000:
                    return n, f"{n} دينار"
            elif "الف" in tail or "ألف" in tail or n <= 300:
                return n * 1000, f"{n} ألف"
        # 2) "الفين دينار" / "الفين للمتر"
        if re.search(r"الفين\s*(?:دينار|للمتر|المتر)?", text):
            return 2000, "الفين دينار"
        # 3) "متر N ألف" / "بN الف" / "N ألف"
        match = None
        for candidate in re.finditer(r"(\d{1,3})\s*(?:الف|ألف)", text):
            context = text[max(0, candidate.start() - 14):candidate.start()]
            if re.search(r"توصيل|شحن|دلفري|دولار", context):
                continue
            match = candidate
            break
        if match:
            n = int(match.group(1))
            if 1 <= n <= 300:
                return n * 1000, f"{n} ألف"
        # 4) "متر N دينار" / "N دينار"
        match = re.search(r"(\d{3,6})\s*(?:دينار|د\.ع)", text)
        if match:
            n = int(match.group(1))
            if 1000 <= n <= 400000:
                return n, f"{n} دينار"
        # 5) "سعر المتر 15000"
        match = re.search(r"سعر\s*(?:ال)?متر\s*[:\-]?\s*(\d{3,6})", text)
        if match:
            n = int(match.group(1))
            if 1000 <= n <= 400000:
                return n, f"{n} دينار"
        # 6) bare number in the dedicated price column only
        if allow_leading:
            match = re.match(r"^\s*(\d{1,3})(?!\d)", text)
            if match:
                n = int(match.group(1))
                if 1 <= n <= 300:
                    return n * 1000, f"{n} ألف"
    return 0, ""


def parse_width(*texts: str) -> str:
    for raw in texts:
        if not raw:
            continue
        text = num(raw)
        match = re.search(r"(?:عرض|عرض لقماش)?\D{0,6}(\d{3})\s*(?:cm|سم|سنتيم|سانتيم)?", text, re.I)
        if match and 100 <= int(match.group(1)) <= 200:
            return f"{int(match.group(1))} سم"
    return ""


def pick_category(name: str, families: str, description: str) -> str:
    source = f"{name} {families} {description}"
    if "هارفرد" in source or "Harvard" in source:
        return "harvard"
    if any(word in source for word in EMBROIDER_WORDS):
        return "embroidered"
    if any(word in source for word in SEQUIN_WORDS):
        return "sequined"
    if any(word in source for word in STRETCH_WORDS):
        return "stretch"
    if any(word in source for word in PATTERN_WORDS):
        return "patterned"
    return "plain"


def extract_colors(*texts: str) -> list[dict]:
    source = " ".join(t or "" for t in texts)
    found: list[str] = []
    for word in COLOR_WORDS:
        if word in source and word not in found:
            found.append(word)
    return [{"id": f"color-{i + 1}", "name": word, "hex": COLOR_HEX[word], "available": True, "stockMeters": 10}
            for i, word in enumerate(found[:5])]


def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}"


def hex_distance(a: str, b: str) -> float:
    a = a.lstrip("#")
    b = b.lstrip("#")
    ar, ag, ab = (int(a[i:i + 2], 16) for i in (0, 2, 4))
    br, bg, bb = (int(b[i:i + 2], 16) for i in (0, 2, 4))
    return ((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2) ** 0.5


def palette_from_image(path: str, count: int = 5) -> list[dict]:
    """Dominant colours of a photo — the automatic colour detection tool."""
    try:
        with Image.open(path) as image:
            image = image.convert("RGB")
            image.thumbnail((160, 160))
            quantised = image.quantize(colors=16, method=Image.Quantize.MEDIANCUT)
            palette = quantised.getpalette()
            counts = sorted(quantised.getcolors() or [], reverse=True)
            total = sum(size for size, _ in counts) or 1
    except Exception:
        return []
    picked: list[dict] = []
    for size, index in counts:
        if size / total < 0.04:
            continue
        r, g, b = palette[index * 3:index * 3 + 3]
        hex_value = rgb_to_hex(r, g, b)
        luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
        if luminance < 0.06 or luminance > 0.97:
            continue
        if any(hex_distance(hex_value, item["hex"]) < 40 for item in picked):
            continue
        nearest = min(NAMED_PALETTE, key=lambda pair: hex_distance(hex_value, pair[1]))
        name = nearest[0] if hex_distance(hex_value, nearest[1]) < 60 else "لون مميّز"
        picked.append({
            "id": f"color-{len(picked) + 1}",
            "name": name,
            "hex": hex_value,
            "available": True,
            "stockMeters": 10,
            "share": round(size / total, 3),
        })
        if len(picked) >= count:
            break
    picked.sort(key=lambda item: -item["share"])
    for i, item in enumerate(picked):
        item["id"] = f"color-{i + 1}"
        item.pop("share", None)
    return picked


def write_variants(source: str, dest_jpg: str) -> None:
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.save(dest_jpg, "JPEG", quality=86, optimize=True, progressive=True)
        for width in WIDTHS:
            variant = image.copy()
            if variant.width > width:
                height = round(variant.height * width / variant.width)
                variant = variant.resize((width, height), Image.Resampling.LANCZOS)
            variant.save(re.sub(r"\.jpg$", f"-{width}.webp", dest_jpg), "WEBP", quality=82, method=6)


def main() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    rows = list(csv.DictReader(open(CARDS, encoding="utf-8-sig")))

    captions: dict[str, list[str]] = {}
    for record in csv.DictReader(open(os.path.join(INDEX, "01_فهرس_الكل.csv"), encoding="utf-8-sig")):
        captions.setdefault(record.get("code", ""), []).append(
            f"{record.get('caption', '')} {record.get('desc', '')}"
        )

    products: list[dict] = []
    report: list[str] = ["# تقرير استيراد المنتجات", ""]
    used_slugs: set[str] = set()
    skipped_price = 0

    for order, row in enumerate(rows, start=1):
        kind = (row.get("التصنيف") or "").strip()
        if kind.startswith("محتوى عام"):
            continue
        rel = (row.get("المجلد") or "").strip().replace("\\", "/")
        folder = os.path.join(EXTRACT, *rel.split("/")) if rel else ""

        meta_path = os.path.join(folder, "بيانات_المتجر.json") if folder else ""
        meta = {}
        if meta_path and os.path.isfile(meta_path):
            try:
                meta = json.load(open(meta_path, encoding="utf-8"))
            except Exception:
                meta = {}

        name = (row.get("اسم_المتجر") or "").strip()
        if not name:
            continue
        families = (row.get("القسم") or "").strip()
        description = (row.get("الوصف") or "").strip()
        country = (row.get("بلد_الصناعة") or "").strip()
        uses = (row.get("الاستخدامات") or "").strip()
        links = [link.strip() for link in (row.get("روابط") or "").split() if link.strip()]
        codes = (meta.get("كودات_المنشورات") or []) if isinstance(meta, dict) else []
        extra_caption = " ".join(" ".join(captions.get(code, [])) for code in codes)
        extra_texts = [extra_caption]
        if isinstance(meta, dict):
            extra_texts.append(str(meta.get("ملاحظات_الفهرس") or ""))
        for filename in sorted(os.listdir(folder)) if folder and os.path.isdir(folder) else []:
            if filename.endswith(("_transcript_plain.txt", "_transcript.txt")) or filename in ("بيانات_للمتجر.txt", "المواصفات.txt"):
                try:
                    extra_texts.append(open(os.path.join(folder, filename), encoding="utf-8").read())
                except Exception:
                    pass
        extra_texts.append(description)

        slug = ascii_slug(name)
        if not slug:
            slug = f"item-{order:03d}"
        base = slug
        suffix = 2
        while slug in used_slugs:
            slug = f"{base}-{suffix}"
            suffix += 1
        used_slugs.add(slug)

        price, price_hint = parse_price(row.get("السعر") or "", *extra_texts)
        if not price:
            skipped_price += 1
        width = parse_width(row.get("عرض_القماش") or "", *extra_texts, families)

        is_style = kind.startswith("فيديو ستايلات")
        category = "style" if is_style else pick_category(name, families, description)
        stretch = any(word in f"{name} {families} {description}" for word in STRETCH_WORDS)
        heavy = any(word in f"{families} {description}" for word in WEIGHT_WORDS_HEAVY)
        light = any(word in f"{families} {description}" for word in WEIGHT_WORDS_LIGHT)

        specs = {
            "composition": families or "غير محددة",
            "width": width or "غير محددة",
            "weight": "ثقيل" if heavy else ("خفيف" if light else "متوسط"),
            "stretch": "مطاطي" if stretch else "غير مطاطي",
            "isStretch": stretch,
            "opacity": "غير شفاف",
            "finish": "لامع" if any(word in f"{families} {name}" for word in SEQUIN_WORDS) else "مطفي",
            "care": "غسيل لطيف على البارد وتجفيف بعيداً عن الشمس المباشرة",
            "use": uses or "حسب تصميم القطعة",
        }

        colors = extract_colors(row.get("الألوان") or "", families, description, name)

        image_dir = os.path.join(folder, "صور") if folder else ""
        sources = sorted(
            os.path.join(image_dir, item)
            for item in (os.listdir(image_dir) if os.path.isdir(image_dir) else [])
            if item.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
        )

        images: list[str] = []
        if sources:
            target_dir = os.path.join(PRODUCTS_DIR, slug)
            os.makedirs(target_dir, exist_ok=True)
            for index, source in enumerate(sources, start=1):
                dest = os.path.join(target_dir, f"{index:02d}.jpg")
                if not os.path.isfile(dest):
                    write_variants(source, dest)
                images.append(f"products/{slug}/{index:02d}.jpg")
            if not colors:
                colors = palette_from_image(sources[0])

        if not images:
            images = ["fabrics/hero.jpg"]

        if not price:
            report.append(f"- **{name}** (`{slug}`): لم يُعثر على سعر صريح — راجعيه من لوحة المدير.")

        product = {
            "id": slug,
            "slug": slug,
            "name": name,
            "type": ("ستايل جاهز" if is_style else "قماش"),
            "categoryId": category,
            "description": description or f"{name} — {families}".strip(" —"),
            "price": price,
            "image": images[0],
            "images": images,
            "colors": colors,
            "colorsEnabled": bool(colors),
            "specs": specs,
            "faqs": [
                {"question": "ما عرض القماش؟", "answer": width or "١٥٠ سم غالباً — تأكدي قبل الطلب."},
                {"question": "هل يمكن طلب نصف متر؟", "answer": "نعم، الحد الأدنى نصف متر وتُضاف الكمية على خطوات ٠٫٥ م."},
            ],
            "isNew": order <= 12,
            "isFeatured": bool(price) or len(sources) > 1,
            "stockMeters": 60 if sources else 25,
            "sourceUrl": links[0] if links else "",
            "createdAt": "2026-10-06",
            "sort_order": order,
            "_priceHint": price_hint,
            "_country": country,
            "_links": links,
        }
        products.append(product)

    categories = [
        {"id": "style", "slug": "style", "name": "ستايلات جاهزة", "description": "تنسيقات تجمع أكثر من قماش", "image": "fabrics/hero.jpg", "accent": "#7a5a6b", "sort_order": 1},
        {"id": "embroidered", "slug": "embroidered", "name": "مطرز", "description": "تطريز بارز وخيوط فاخرة", "image": "fabrics/rose.jpg", "accent": "#8f4766", "sort_order": 2},
        {"id": "plain", "slug": "plain", "name": "سادة", "description": "ألوان هادئة للاستخدام اليومي", "image": "fabrics/blue.jpg", "accent": "#42647b", "sort_order": 3},
        {"id": "stretch", "slug": "stretch", "name": "مطاطي", "description": "سبانديكس وتويل بمرونة مريحة", "image": "fabrics/emerald.jpg", "accent": "#34715e", "sort_order": 4},
        {"id": "sequined", "slug": "sequined", "name": "ترتر ولمّاع", "description": "بريق وحركة للحفلات", "image": "fabrics/hero.jpg", "accent": "#8d2b4f", "sort_order": 5},
        {"id": "patterned", "slug": "patterned", "name": "مزخرف", "description": "نقوش جاكار وتطريز منظم", "image": "fabrics/rose.jpg", "accent": "#8c5c82", "sort_order": 6},
        {"id": "harvard", "slug": "harvard", "name": "هارفرد", "description": "فيسكوز ثقيل تايواني بعرض ١٥٣ سم", "image": "fabrics/harvard-cover.jpg", "accent": "#5f6b7a", "sort_order": 7},
    ]

    json.dump(products, open(os.path.join(DATA_DIR, "products.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    json.dump(categories, open(os.path.join(DATA_DIR, "categories.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    with_images = sum(1 for product in products if product["image"] != "fabrics/hero.jpg")
    with_price = sum(1 for product in products if product["price"] > 0)
    with_colors = sum(1 for product in products if product["colors"])
    counts = Counter(product["categoryId"] for product in products)

    report += [
        "",
        f"- إجمالي المنتجات المستوردة: **{len(products)}**",
        f"- منتجات لها صور: **{with_images}**",
        f"- منتجات لها سعر مستخرج: **{with_price}** (بدون سعر: {len(products) - with_price})",
        f"- منتجات بها ألوان مستخرجة تلقائياً: **{with_colors}**",
        f"- التوزيع حسب القسم: {dict(counts)}",
        "",
        "> الأسعار المستخرجة آلية من نصوص إنستغرام؛ راجعيها من لوحة المدير قبل النشر.",
        "",
    ]
    open(os.path.join(DATA_DIR, "import-report.md"), "w", encoding="utf-8").write("\n".join(report))

    print(json.dumps({
        "products": len(products),
        "with_images": with_images,
        "with_price": with_price,
        "with_colors": with_colors,
        "missing_price": skipped_price,
        "by_category": dict(counts),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
