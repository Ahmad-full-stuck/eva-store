const ALLOWED_PRODUCTS = new Set([
  "mass-pro",
  "creatine",
  "carb-x",
  "critical-mass",
  "yava-iso"
]);

const ALLOWED_AREAS = new Set([
  "بغداد — الكرخ / أبو غريب",
  "ديالى — بعقوبة",
  "محافظة أخرى"
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff"
    }
  });
}

function validString(value, maxLength) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function validateOrder(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "صيغة الطلب غير صحيحة.";
  }
  const customer = payload.customer;
  if (!customer || typeof customer !== "object" || Array.isArray(customer)) {
    return "بيانات العميل غير مكتملة.";
  }
  if (!validString(customer.name, 70)) return "يرجى إدخال اسم صحيح.";
  if (!validString(customer.phone, 24)) return "يرجى إدخال رقم هاتف صحيح.";
  const normalizedPhone = customer.phone.replace(/\D/g, "");
  if (normalizedPhone.length < 7 || normalizedPhone.length > 18) return "تحقق من رقم الهاتف.";
  if (!ALLOWED_AREAS.has(customer.area)) return "منطقة التوصيل غير معروفة.";
  if (customer.note != null && (typeof customer.note !== "string" || customer.note.length > 300)) {
    return "الملاحظة أطول من الحد المسموح.";
  }
  if (!Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > 20) {
    return "أضف منتجاً واحداً على الأقل إلى الطلب.";
  }
  for (const item of payload.items) {
    if (!item || typeof item !== "object" || !ALLOWED_PRODUCTS.has(item.id)) {
      return "أحد المنتجات المرسلة غير معروف.";
    }
    if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 50) {
      return "تحقق من كمية المنتجات.";
    }
    if (!validString(item.flavor, 60)) return "حدد خيار المنتج.";
  }
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);
      return json({ ok: true, service: "zaytoun-demo-api", mode: "demo", durableStorage: false });
    }

    if (url.pathname === "/api/orders") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "استخدم POST لإرسال الطلب." }, 405);
      }
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        return json({ ok: false, error: "يجب إرسال الطلب بصيغة JSON." }, 415);
      }
      const declaredLength = Number(request.headers.get("content-length") || "0");
      if (declaredLength > 32000) return json({ ok: false, error: "حجم الطلب أكبر من المسموح." }, 413);

      let payload;
      try {
        const raw = await request.text();
        if (raw.length > 32000) return json({ ok: false, error: "حجم الطلب أكبر من المسموح." }, 413);
        payload = JSON.parse(raw);
      } catch {
        return json({ ok: false, error: "تعذر قراءة بيانات الطلب." }, 400);
      }

      const error = validateOrder(payload);
      if (error) return json({ ok: false, error }, 400);

      // Demo only: validate and process the request on the Worker, but never persist customer data.
      const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const orderId = "ZG-DEMO-" + date + "-" + suffix;
      return json({
        ok: true,
        mode: "demo",
        persisted: false,
        orderId,
        message: "تم استلام الطلب على خادم المعاينة. لم يتم حفظ البيانات بشكل دائم."
      }, 201);
    }

    if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return new Response("Static asset binding is not available", {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }
      });
    }
    return env.ASSETS.fetch(request);
  }
};
