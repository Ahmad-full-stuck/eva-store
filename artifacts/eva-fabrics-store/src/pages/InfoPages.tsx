import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, BadgeCheck, Check, ChevronDown, Clock, Heart, Instagram, Layers, MapPin, MessageCircle, PackageCheck, Phone, Ruler, RotateCcw, Scissors, Search, Send, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import type { ProductFaq } from '@/types'
import { formatMeters, formatPrice, normalizeArabic } from '@/lib/catalog'
import { guideQuestions } from '@/lib/fallback-data'
import { apiUrl, siteConfig } from '@/lib/site'

const glassCss = `
.glass {
  background: linear-gradient(150deg, rgba(255, 255, 255, .8), rgba(255, 250, 245, .46));
  border: 1px solid rgba(255, 255, 255, .85);
  box-shadow: 0 24px 55px rgba(70, 45, 35, .1);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
}
.glass-card { padding: 26px; border-radius: 24px; }
.glass-dark {
  color: #fff8f1;
  background: linear-gradient(150deg, rgba(48, 38, 42, .93), rgba(48, 38, 42, .76));
  border: 1px solid rgba(255, 255, 255, .16);
  box-shadow: 0 24px 55px rgba(35, 24, 27, .28);
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
}
.glass-dark p, .glass-dark small, .glass-dark li { color: #cdbdba; }
.glass-dark .eyebrow { color: #f0a98a; }
.glass-dark .button-outline { color: #fff8f1; border-color: rgba(255, 248, 241, .4); }
.glass-dark .button-outline:hover { color: #fff; border-color: #fff8f1; background: rgba(255, 248, 241, .14); }
.glass-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  color: var(--eva-rose);
  background: rgba(255, 255, 255, .68);
  border: 1px solid rgba(255, 255, 255, .92);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(70, 45, 35, .08);
}
.glass-input {
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  color: var(--eva-ink);
  background: rgba(255, 255, 255, .74);
  border: 1px solid rgba(255, 255, 255, .95);
  border-radius: 14px;
  outline: 0;
  font-size: 13px;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.glass-input::placeholder { color: #a9938e; }
.glass-input:focus { border-color: rgba(183, 44, 111, .55); box-shadow: 0 0 0 3px rgba(183, 44, 111, .14); }
textarea.glass-input { min-height: 132px; resize: vertical; line-height: 1.9; }
.section-soft {
  padding: 46px 40px;
  background: linear-gradient(160deg, rgba(255, 255, 255, .74), rgba(241, 232, 224, .88));
  border: 1px solid rgba(255, 255, 255, .85);
  border-radius: 26px;
  box-shadow: 0 18px 44px rgba(70, 45, 35, .07);
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  color: var(--eva-rose);
  background: rgba(183, 44, 111, .09);
  border: 1px solid rgba(183, 44, 111, .22);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  transition: background-color .2s ease, border-color .2s ease, color .2s ease;
}
.chip:hover { background: rgba(183, 44, 111, .16); border-color: rgba(183, 44, 111, .5); }
.chip-neutral { color: var(--eva-muted); background: rgba(255, 255, 255, .62); border-color: rgba(232, 220, 211, .95); }
.chip-neutral:hover { color: var(--eva-rose); border-color: rgba(183, 44, 111, .4); }
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.stars { display: inline-flex; align-items: center; gap: 3px; color: #e0a13c; }
.stars svg { width: 14px; height: 14px; fill: currentColor; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.steps-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.testimonials-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.about-values { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.stat-card { position: relative; overflow: hidden; }
.stat-card:before {
  content: '';
  position: absolute;
  right: -34px;
  bottom: -40px;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(183, 44, 111, .2), rgba(183, 44, 111, 0));
}
.stat-label { position: relative; display: block; color: var(--eva-muted); font-size: 11px; }
.stat-value { position: relative; display: block; margin-top: 8px; color: var(--eva-rose); font-size: clamp(30px, 4vw, 40px); line-height: 1.15; letter-spacing: -.02em; }
.stat-note { position: relative; display: block; margin-top: 6px; color: var(--eva-muted); font-size: 10px; line-height: 1.7; }
.value-card h3 { margin-top: 14px; font-size: 14px; }
.value-card p { margin-top: 7px; color: var(--eva-muted); font-size: 12px; line-height: 1.95; }
.value-icon { width: 42px; height: 42px; display: grid; place-items: center; color: var(--eva-rose); background: rgba(183, 44, 111, .1); border: 1px solid rgba(183, 44, 111, .2); border-radius: 14px; }
.timeline { position: relative; display: grid; gap: 14px; margin: 26px 0 0; padding: 0; list-style: none; }
.timeline:before {
  content: '';
  position: absolute;
  top: 14px;
  bottom: 14px;
  right: 14px;
  width: 1px;
  background: linear-gradient(180deg, rgba(183, 44, 111, .55), rgba(216, 198, 187, .8));
}
.timeline-item { position: relative; display: grid; grid-template-columns: 29px minmax(0, 1fr); gap: 15px; align-items: start; }
.timeline-dot {
  width: 29px;
  height: 29px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--eva-rose);
  border-radius: 50%;
  font-size: 10px;
  font-weight: 600;
  box-shadow: 0 0 0 5px rgba(183, 44, 111, .12);
}
.timeline-body { padding: 18px 20px; }
.timeline-year { display: block; color: var(--eva-rose); font-size: 10px; font-weight: 600; letter-spacing: .04em; }
.timeline-body strong { display: block; margin-top: 5px; font-size: 14px; }
.timeline-body p { margin-top: 6px; color: var(--eva-muted); font-size: 12px; line-height: 1.95; }
.quote-card { display: flex; flex-direction: column; gap: 12px; }
.quote-text { color: var(--eva-ink); font-size: 13px; line-height: 2; }
.quote-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 12px; border-top: 1px solid rgba(232, 220, 211, .9); }
.quote-name { display: grid; gap: 2px; }
.quote-name strong { font-size: 12px; }
.quote-name small { color: var(--eva-muted); font-size: 10px; }
.about-cta { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 22px; margin-top: 55px; padding: 38px 40px; border-radius: 26px; }
.about-cta h2 { margin-top: 8px; font-size: clamp(22px, 3vw, 30px); }
.about-cta p { max-width: 470px; margin-top: 9px; color: #cdbdba; font-size: 13px; line-height: 2; }
.cta-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.section-head-tight { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
.section-head-tight h2 { margin-top: 7px; font-size: clamp(22px, 3.2vw, 31px); line-height: 1.4; }
.section-head-tight p { margin-top: 7px; color: var(--eva-muted); font-size: 13px; line-height: 1.9; }
.story-copy-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 22px; }
.story-copy-grid p { color: var(--eva-muted); font-size: 13px; line-height: 2.1; }
.tips-table-wrap { overflow-x: auto; border: 1px solid rgba(255, 255, 255, .85); border-radius: 20px; background: rgba(255, 255, 255, .58); }
.tips-table { width: 100%; min-width: 660px; border-collapse: collapse; font-size: 12px; }
.tips-table caption { padding: 15px 18px 0; color: var(--eva-muted); font-size: 11px; text-align: right; }
.tips-table th, .tips-table td { padding: 13px 16px; text-align: right; vertical-align: top; }
.tips-table thead th { color: #fff8f1; background: rgba(48, 38, 42, .94); font-size: 11px; font-weight: 600; }
.tips-table tbody tr + tr { border-top: 1px solid rgba(232, 220, 211, .95); }
.tips-table tbody tr:nth-child(even) { background: rgba(255, 255, 255, .5); }
.tips-table tbody th { color: var(--eva-rose); font-weight: 600; }
.tips-table td small { display: block; margin-top: 3px; color: var(--eva-muted); font-size: 10px; line-height: 1.7; }
.table-hint { display: none; margin-top: 9px; color: var(--eva-muted); font-size: 10px; }
.guide-checklist { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 20px 0 0; padding: 0; }
.guide-checklist li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 13px 15px;
  list-style: none;
  background: rgba(255, 255, 255, .62);
  border: 1px solid rgba(255, 255, 255, .9);
  border-radius: 16px;
  font-size: 12px;
  line-height: 1.85;
}
.guide-checklist svg { flex: 0 0 auto; margin-top: 4px; color: var(--eva-green); }
.contact-hours { display: grid; gap: 10px; margin-top: 24px; padding: 20px 22px; border-radius: 20px; }
.hours-title { display: flex; align-items: center; gap: 8px; color: var(--eva-rose); font-size: 12px; font-weight: 600; }
.hours-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding-bottom: 9px; border-bottom: 1px solid rgba(232, 220, 211, .9); color: var(--eva-muted); font-size: 11px; }
.hours-row:last-child { padding-bottom: 0; border-bottom: 0; }
.hours-row strong { color: var(--eva-ink); font-size: 11px; }
.map-card { position: relative; overflow: hidden; display: grid; gap: 16px; margin-top: 16px; padding: 24px; border-radius: 24px; }
.map-grid {
  position: absolute;
  inset: 0;
  opacity: .55;
  background-image: linear-gradient(rgba(255, 255, 255, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, .08) 1px, transparent 1px);
  background-size: 34px 34px;
}
.map-copy { position: relative; display: grid; gap: 9px; justify-items: start; }
.map-pin { width: 40px; height: 40px; display: grid; place-items: center; color: #fff; background: var(--eva-rose); border-radius: 50%; box-shadow: 0 10px 24px rgba(183, 44, 111, .45); }
.map-copy strong { font-size: 14px; }
.map-copy p { color: #cdbdba; font-size: 12px; line-height: 2; }
.map-card .button { position: relative; }
.contact-form { border-radius: 24px; }
.form-status { display: flex; align-items: flex-start; gap: 9px; margin-top: 16px; padding: 14px 16px; border-radius: 16px; font-size: 12px; line-height: 1.9; }
.form-status svg { flex: 0 0 auto; margin-top: 4px; }
.form-status-error { color: #9a463c; background: #f9ece7; border: 1px solid #edcfc6; }
.form-status-success { color: var(--eva-green); background: #edf4eb; border: 1px solid #d8e7d4; }
.form-status-info { color: var(--eva-rose); background: rgba(183, 44, 111, .08); border: 1px solid rgba(183, 44, 111, .24); }
.form-status a { font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
.form-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.policy-accordions { display: grid; gap: 12px; max-width: 880px; }
.policy-accordion { padding: 0 24px; transition: border-color .2s ease, box-shadow .2s ease; }
.policy-accordion summary { min-height: 68px; display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; align-items: center; gap: 12px; cursor: pointer; list-style: none; }
.policy-accordion summary::-webkit-details-marker { display: none; }
.policy-accordion summary > span { color: var(--eva-rose); font-size: 11px; font-weight: 600; }
.policy-accordion summary strong { font-size: 14px; transition: color .2s ease; }
.policy-accordion summary:hover strong { color: var(--eva-rose); }
.policy-accordion summary svg { color: var(--eva-muted); transition: transform .2s ease; }
.policy-accordion[open] { border-color: rgba(183, 44, 111, .4); box-shadow: 0 24px 55px rgba(183, 44, 111, .12); }
.policy-accordion[open] summary svg { transform: rotate(180deg); }
.policy-body { padding-bottom: 24px; }
.policy-body p { color: var(--eva-muted); font-size: 13px; line-height: 2.1; }
.policy-body ul { display: grid; gap: 8px; margin: 12px 0 0; padding-inline-start: 18px; color: var(--eva-muted); font-size: 12px; line-height: 1.95; }
.policy-body li::marker { color: var(--eva-rose); }
.policy-body p.policy-highlight { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding: 12px 14px; color: var(--eva-rose); background: rgba(183, 44, 111, .08); border: 1px solid rgba(183, 44, 111, .2); border-radius: 14px; font-size: 11px; line-height: 1.8; }
.policy-body p.policy-highlight svg { flex: 0 0 auto; }
.form-footnote a { color: var(--eva-rose); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
.chip-dark { color: #ffe9df; background: rgba(255, 248, 241, .12); border-color: rgba(255, 248, 241, .3); }
.chip-dark:hover { background: rgba(255, 248, 241, .2); border-color: rgba(255, 248, 241, .55); }
.tracking-form input:focus-visible { outline: 3px solid rgba(183, 44, 111, .35); outline-offset: 3px; border-radius: 6px; }
.confirmation-panel { width: min(780px, 100%); padding: 44px 38px; }
.confirmation-panel h1 { margin-top: 9px; font-size: clamp(28px, 4.4vw, 44px); }
.confirmation-panel > p { max-width: 470px; margin: 12px auto 0; color: var(--eva-muted); font-size: 13px; line-height: 2; }
.status-panel { margin-top: 26px; padding: 26px; border-radius: 22px; text-align: right; }
.status-head { display: grid; gap: 4px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, .14); }
.status-head span { color: #f0a98a; font-size: 10px; }
.status-head strong { font-size: 16px; }
.status-head small { color: #bcaeaa; font-size: 10px; }
.status-steps { display: grid; gap: 14px; margin: 18px 0 0; padding: 0; list-style: none; }
.status-steps li { position: relative; display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 12px; align-items: center; }
.status-steps li:not(:last-child):after { content: ''; position: absolute; top: 30px; bottom: -14px; right: 14px; width: 1px; background: rgba(255, 255, 255, .16); }
.status-steps li > span { width: 30px; height: 30px; display: grid; place-items: center; color: #cdbdba; background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .2); border-radius: 50%; font-size: 11px; z-index: 1; }
.status-steps li.is-done > span { color: #fff; background: var(--eva-green); border-color: var(--eva-green); }
.status-steps li.is-done:not(:last-child):after { background: rgba(73, 118, 91, .75); }
.status-steps strong { display: block; font-size: 12px; }
.status-steps small { display: block; margin-top: 2px; color: #bcaeaa; font-size: 10px; }
.status-items { display: grid; gap: 8px; margin-top: 18px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, .14); }
.status-items > span { color: #f0a98a; font-size: 10px; }
.status-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #cdbdba; font-size: 11px; }
.status-item b { color: #fff8f1; font-weight: 600; }
.order-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.order-empty { width: min(660px, 100%); margin: 40px auto 0; padding: 42px 30px; border-radius: 28px; text-align: center; }
.order-empty h1 { margin-top: 16px; font-size: clamp(24px, 3.6vw, 32px); }
.order-empty > p { max-width: 440px; margin: 10px auto 0; color: var(--eva-muted); font-size: 13px; line-height: 2; }
.order-empty .empty-icon { margin: 0 auto; }
.empty-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 24px; }
.local-orders { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; margin-top: 22px; }
.local-orders > span { color: var(--eva-muted); font-size: 10px; }
.tracking-card, .tracking-card.glass { border-radius: 26px; }
.tracking-result-glass { display: flex; align-items: flex-start; gap: 10px; margin-top: 22px; padding: 16px; border-radius: 18px; text-align: right; }
.tracking-result-glass > div { display: grid; gap: 5px; }
.tracking-result-glass strong { font-size: 13px; }
.tracking-result-glass p { color: var(--eva-muted); font-size: 11px; line-height: 1.9; }
.favorites-grid .favorite-tile { padding: 12px 12px 14px; border-radius: 22px; }
.favorite-tile-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(232, 220, 211, .9); }
.favorite-tile-actions .chip { cursor: pointer; }
.empty-glass { width: min(660px, 100%); margin: 40px auto 0; padding: 42px 30px; border-radius: 28px; text-align: center; }
.empty-glass .empty-icon { margin: 0 auto; }
.empty-glass h1 { margin-top: 20px; font-size: clamp(24px, 3.8vw, 32px); }
.empty-glass > p { max-width: 430px; margin: 9px auto 0; color: var(--eva-muted); font-size: 13px; line-height: 2; }
.favorites-note { margin-top: 45px; }
.not-found-page { min-height: 74vh; display: flex; align-items: center; justify-content: center; padding: 70px 0 90px; }
.not-found-card { position: relative; overflow: hidden; width: min(720px, 100%); padding: 52px 40px; border-radius: 30px; text-align: center; }
.not-found-code { display: block; color: rgba(183, 44, 111, .18); font-size: clamp(74px, 16vw, 132px); font-weight: 700; line-height: .95; letter-spacing: -.06em; }
.not-found-card h1 { margin-top: 6px; font-size: clamp(26px, 4vw, 38px); }
.not-found-card > p { max-width: 470px; margin: 12px auto 0; color: var(--eva-muted); font-size: 13px; line-height: 2; }
.not-found-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 26px; }
.not-found-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 26px; padding-top: 22px; border-top: 1px solid rgba(232, 220, 211, .9); }
@media (min-width: 720px) {
  .status-steps { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
  .status-steps li { grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 8px; text-align: center; }
  .status-steps li:not(:last-child):after { top: 15px; right: auto; bottom: auto; left: 50%; width: 100%; height: 1px; }
}
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .about-values { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .testimonials-grid, .steps-grid { grid-template-columns: minmax(0, 1fr); }
  .section-soft { padding: 34px 24px; }
  .story-copy-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 720px) {
  .guide-checklist { grid-template-columns: minmax(0, 1fr); }
  .table-hint { display: block; }
  .section-head-tight { flex-direction: column; align-items: flex-start; gap: 12px; }
  .about-cta { padding: 28px 22px; }
  .confirmation-panel { padding: 34px 20px; }
}
@media (max-width: 560px) {
  .stats-grid, .about-values { grid-template-columns: minmax(0, 1fr); }
  .favorites-grid { grid-template-columns: minmax(0, 1fr); }
  .glass-card { padding: 20px 18px; }
  .confirmation-panel { padding: 34px 20px; }
  .timeline:before { right: 14px; }
  .policy-accordion { padding: 0 16px; }
  .not-found-card { padding: 38px 20px; }
  .order-empty, .empty-glass { padding: 32px 18px; }
}
`;

export function GlassStyles() {
  return <style>{glassCss}</style>
}
interface AboutStat {
  label: string
  value: number
  note: string
}

const aboutStats: AboutStat[] = [
  { label: 'خامة في المعرض', value: 139, note: 'تشكيلة تتجدد مع كل موسم' },
  { label: 'أقسام للتصنيف', value: 5, note: 'مطرز، سادة، مطاطي، ترتر، مزخرف' },
  { label: 'محافظة نغطيها', value: 18, note: 'توصيل إلى كل العراق' },
  { label: 'طلب مكتمل', value: 2400, note: 'منذ انطلاق المتجر' },
]

const aboutValues = [
  { title: 'وضوح قبل الشراء', text: 'نكتب الشفافية والمرونة والوزن كما هي، بلا مبالغة ولا وعود مبهمة.', icon: <BadgeCheck size={18} /> },
  { title: 'جودة تُلمَس', text: 'نراجع النسيج والتشطيب والثبات قبل أن تدخل الخامة إلى المعرض.', icon: <ShieldCheck size={18} /> },
  { title: 'قرب من العميل', text: 'نسأل عن قصتك قبل أن نقترح الخامة، ونبقى معك حتى الاستلام.', icon: <MessageCircle size={18} /> },
  { title: 'ابدئي من نصف متر', text: 'لا نفرض كميات كبيرة؛ اطلبي ما تحتاجينه فعلاً وزيدي لاحقاً.', icon: <Ruler size={18} /> },
]

const aboutTimeline = [
  { year: '٢٠١٩', title: 'بداية من زاوية صغيرة', text: 'عرضنا خامتين يوميتين وشرحنا الفرق بينهما بالصور واللمس، فبدأ الطلب يتوافد.' },
  { year: '٢٠٢١', title: 'قسم للمطرز والمناسبات', text: 'أضفنا التافتا والكريب المطرز مع شرح التطريز والعناية به بعد الحلاقة.' },
  { year: '٢٠٢٣', title: 'ولدت فكرة الدليل', text: 'نشرنا دليل الأقمشة ليجيب عن الأسئلة التي تصلنا يومياً قبل الطلب.' },
  { year: '٢٠٢٥', title: 'المتجر يبدأ أونلاين', text: 'أصبح بإمكانك تصفّح المواصفات كاملة وطلب نصف متر من أي محافظة.' },
  { year: '٢٠٢٦', title: 'توصيل لكل العراق', text: 'شبكة شحن تغطي المحافظات مع متابعة الطلب عبر واتساب ورقم الطلب.' },
]

const testimonials = [
  { name: 'سارة م.', city: 'بغداد', text: 'وصف الشفافية والمرونة كان أميضاً من الصور؛ وصل القماش مطابقاً لما توقعته.' },
  { name: 'نور الهدى ك.', city: 'البصرة', text: 'طلبت نصف متر فقط لتجربة اللون، ثم أكملت الطلب بعد التأكد من الدرجة.' },
  { name: 'رنا ع.', city: 'أربيل', text: 'الرد عبر واتساب كان سريعاً، وساعدوني في حساب كمية العباءة قبل الشراء.' },
]

export function AboutPage() {
  return (
    <>
      <GlassStyles />
      <main className="container-eva info-page">
        <div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>›</span><span>من نحن</span></div>

        <section className="about-hero">
          <div className="about-copy">
            <span className="eyebrow"><Sparkles size={14} />من إيفا إلى يدك</span>
            <h1>قصة إيفا تبدأ بسؤال واحد: ماذا ستصنعين؟</h1>
            <p>بدأت إيفا ستور بفكرة بسيطة: أن يرى الزبون الخامة كما تراها الخياطة، بشرح واضح للّمس والامتداد واللون قبل أن تدفع ديناراً واحداً. اليوم نعرض تشكيلة متنوعة مع مواصفات مكتوبة وطلب يبدأ من نصف متر.</p>
            <div className="chip-row" style={{ marginTop: '22px' }}>
              <span className="chip"><Ruler size={13} />طلب من نصف متر</span>
              <span className="chip"><ShieldCheck size={13} />مواصفات مكتوبة</span>
              <span className="chip"><Truck size={13} />توصيل لكل العراق</span>
            </div>
            <div className="about-points">
              <div><span>٠١</span><strong>وضوح قبل الطلب</strong><p>مواصفات وخطوات طلب بنصف متر.</p></div>
              <div><span>٠٢</span><strong>اختيار أهدأ</strong><p>صور وتفاصيل تساعدك على المقارنة.</p></div>
              <div><span>٠٣</span><strong>دعم قريب</strong><p>تواصلي معنا قبل وبعد الطلب.</p></div>
            </div>
          </div>
          <div className="about-collage">
            <img src="fabrics/rose.jpg" alt="قماش مطرز من معرض إيفا" />
            <img src="fabrics/blue.jpg" alt="قماش أزرق ناعم" />
            <span>EVA<br /><strong>FABRICS</strong></span>
          </div>
        </section>

        <section className="section-soft" aria-labelledby="about-story-title">
          <div className="section-head-tight">
            <div>
              <span className="eyebrow">قصة البراند</span>
              <h2 id="about-story-title">من زاوية صغيرة إلى عادة يعتمد عليها.</h2>
            </div>
            <Link href="/fabric-guide" className="underlined-link">اقرئي دليل الأقمشة <ArrowLeft size={15} /></Link>
          </div>
          <div className="story-copy-grid">
            <p>في البداية كان العرض محدوداً: قماشان يوميان وسؤال يتكرر من كل زائرة عن الفرق بينهما. أدركنا أن الشرح الواضح أهم من الأرقام، فكتبتنا تفاصيل كل خامة كما تُختبر في الواقع: الوزن، العرض، الشفافية، المرونة، وطريقة العناية.</p>
            <p>اليوم صار المتجر مساحة تجمع التشكيلة والشرح معاً. نبني ثقتك قبل الطلب، ونرتّب الرحلة بعده: تأكيد الطلب، تجهيزه، ثم متابعته برقم واضح حتى يصل إلى بابك.</p>
          </div>
        </section>

        <section className="section-block" aria-labelledby="about-stats-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">أرقام تختصر الرحلة</span>
              <h2 id="about-stats-title">إيفا في أربعة أرقام</h2>
              <p>مؤشرات نحدّثها مع كل موسم وكل قسم جديد يدخل المعرض.</p>
            </div>
          </div>
          <div className="stats-grid">{aboutStats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
        </section>

        <section className="section-block" aria-labelledby="about-values-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ما نؤمن به</span>
              <h2 id="about-values-title">أربع قيم تحكم كل قرار</h2>
              <p>من اختيار الخامة إلى طريقة الرد على رسالتك.</p>
            </div>
          </div>
          <div className="about-values">{aboutValues.map((value) => <article className="glass-card value-card" key={value.title}><span className="value-icon">{value.icon}</span><h3>{value.title}</h3><p>{value.text}</p></article>)}</div>
        </section>

        <section className="section-soft" aria-labelledby="about-timeline-title">
          <div className="section-head-tight">
            <div>
              <span className="eyebrow">الخط الزمني</span>
              <h2 id="about-timeline-title">كيف وصلنا إلى هنا</h2>
            </div>
            <span className="chip chip-neutral">منذ ٢٠١٩</span>
          </div>
          <ol className="timeline">
            {aboutTimeline.map((item, index) => (
              <li className="timeline-item" key={item.year}>
                <span className="timeline-dot" aria-hidden="true">{index + 1}</span>
                <div className="glass-card timeline-body">
                  <span className="timeline-year">{item.year}</span>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section-block" aria-labelledby="about-quotes-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">من صندوق الرسائل</span>
              <h2 id="about-quotes-title">ما قالته عميلاتنا</h2>
              <p>ملاحظات مختصرة بعد تجربة الطلب والاستلام.</p>
            </div>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((item) => (
              <article className="glass-card quote-card" key={item.name}>
                <span className="stars" aria-label="تقييم خمس من خمس">
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} />)}
                </span>
                <p className="quote-text">«{item.text}»</p>
                <div className="quote-head">
                  <span className="quote-name"><strong>{item.name}</strong><small>{item.city}</small></span>
                  <span className="chip chip-neutral">طلب مكتمل</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-cta glass-dark">
          <div>
            <span className="eyebrow"><Sparkles size={14} />الخطوة التالية</span>
            <h2>جاهزة لتختاري خامتك الأولى؟</h2>
            <p>ابدئي من المعرض لتتصفّحي التفاصيل، أو ارسلي لنا ما تبحثين عنه وسنقترح عليك بديلة مناسبة.</p>
          </div>
          <div className="cta-actions">
            <Link href="/catalog" className="button button-primary">تصفحي الأقمشة <ArrowLeft size={16} /></Link>
            <a href={siteConfig.whatsappUrl('مرحباً إيفا، أحتاج مساعدة في اختيار قماش')} target="_blank" rel="noreferrer" className="button button-outline"><MessageCircle size={16} />اسألينا عبر واتساب</a>
          </div>
        </section>
      </main>
    </>
  )
}

function StatCard({ stat }: { stat: AboutStat }) {
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const startedRef = useRef(false)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const node = nodeRef.current
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setValue(stat.value)
      return undefined
    }
    let frame = 0
    const run = () => {
      const startedAt = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / 1100)
        setValue(Math.round(stat.value * (1 - Math.pow(1 - progress, 3))))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }
    if (!node || typeof IntersectionObserver === 'undefined') {
      run()
      return () => cancelAnimationFrame(frame)
    }
    const observer = new IntersectionObserver((entries) => {
      if (!startedRef.current && entries.some((entry) => entry.isIntersecting)) {
        startedRef.current = true
        run()
      }
    }, { threshold: 0.3 })
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [stat.value])

  return (
    <div className="glass-card stat-card" ref={nodeRef}>
      <span className="stat-label">{stat.label}</span>
      <strong className="stat-value" aria-label={`${stat.value} ${stat.label}`}>{value.toLocaleString('ar-IQ')}</strong>
      <span className="stat-note">{stat.note}</span>
    </div>
  )
}
const extraGuideQuestions: ProductFaq[] = [
  { question: 'هل أحتاج إلى بطانة؟', answer: 'إذا ظهر حقل الشفافية بعبارة شفاف أو نصف شفاف فالأجدر استخدام بطانة. القطع الفاتحة والخفيفة تحتاج بطانة دائماً، بينما القماش غير الشفاف يكفي نفسه في الفساتين والعبايات.' },
  { question: 'كيف أختبر المرونة قبل الشراء؟', answer: 'اسحبي القماش برفق بين إصبعين في الاتجاهين: المطاطي يعود إلى مكانه فوراً، والمرونة الخفيفة تعود ببطء، وغير المطاطي يقاوم السحب أصلاً. تفاصيل كل منتج مكتوبة في حقل المرونة.' },
  { question: 'كيف أعتني بالقماش المطرز؟', answer: 'التطريز الحساس يفضّل التنظيف الجاف أو الغسيل اليدوي بماء فاتر مع قلب القطعة قبل التجفيف. تجنّبي المجفف وتعريض التطريز لخطافات الأثاث.' },
  { question: 'ما الفرق بين الكريب والتويل؟', answer: 'الكريب سطحه مطفي بملمس حبيبي خفيف ويستقيم بسرعة، أما التويل فنسيجه قطري أوضح وأكثر ثباتاً في البنية، وهو أنسب للبناطيل والقطع الرسمية.' },
  { question: 'كم متراً أحتاج لعمّة كاملة؟', answer: 'العباءة المستقيمة تحتاج عادة بين ٣ و٤ أمتار، وتزيد القطعة ذات الأكمام الواسعة أو التراكيب. أضيفي نصف متر إضافي للقص إن كان النمط مزدوجاً.' },
]

const fabricTips = [
  { use: 'فستان يومي', fabric: 'لينن قطن أو كريب سبانديكس', weight: 'خفيف إلى متوسط', tip: 'اختر لوناً صلباً يتحمّل الغسيل المتكرر.' },
  { use: 'فستان سهرة', fabric: 'ساتان أو تافتا مطرزة', weight: 'متوسط إلى ثقيل', tip: 'لمعة هادئة وبطانة تمنح القماش سقوطاً أجمل.' },
  { use: 'عباءة أو برنوش', fabric: 'كريب مطرز أو جاكار', weight: 'متوسط', tip: 'راعي السقوط والطول قبل قصّ الأكمام.' },
  { use: 'بناطيل وتنانير', fabric: 'تويل سبانديكس أو تويل قطني', weight: 'متوسط إلى ثقيل', tip: 'مرونة باتجاه واحد تكفي لراحة الحركة.' },
  { use: 'جاكيت شتوي', fabric: 'مخمل', weight: 'ثقيل', tip: 'الوبرة الكثيفة تحفظ الدفئة وتقلل التجعيد.' },
  { use: 'حفلة ومناسبة', fabric: 'ترتر هولوغرام', weight: 'متوسط', tip: 'قصّة بسيطة لأن البريق يضيف حجماً بصرياً.' },
]

const qualityChecks = [
  'اللون متجانس من الحافة إلى الحافة دون تدرّج مفاجئ.',
  'الخيط لا ينفلت بسحب خفيف على الحافة المقصوصة.',
  'الوزن يواجد مع الوصف: خفيف لا يعني رديئاً، وثقيل لا يعني مريحاً.',
  'الطباعة أو التطريز متماسك من الوجهين.',
  'العطر غائب، لأن بقايا المعالجة الكيميائية تظهر لاحقاً.',
  'العرض مطابق للمكتوب، ففرق السنتيمترات يغيّر حساب الكمية.',
]

export function FabricGuidePage() {
  const questions = [...guideQuestions, ...extraGuideQuestions]
  return (
    <>
      <GlassStyles />
      <main className="container-eva info-page">
        <div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>›</span><span>دليل الأقمشة</span></div>

        <section className="info-heading">
          <span className="eyebrow"><Ruler size={14} />تعلّمي قبل أن تختاري</span>
          <h1>دليل الأقمشة الشامل</h1>
          <p>كل خامة لها إيقاعها وطريقة عناية مختلفة. ابدأي من هذه الأسئلة الثلاثة، ثم اقرئي الإجابات السريعة، وأخيراً افتحي صفحة المنتج لتفاصيل الخامة التي تعجبك.</p>
        </section>

        <section className="steps-grid" aria-label="ثلاثة أسئلة قبل الشراء">
          <article className="glass-card">
            <span className="chip">الخطوة ١</span>
            <div className="value-card"><h3>حددي الاستخدام</h3><p>فستان يومي، سهرة، عباءة، بناطيل أو قطعة عملية؟ الاستخدام يضيّق الخيارات إلى خامات معدودة.</p></div>
          </article>
          <article className="glass-card">
            <span className="chip">الخطوة ٢</span>
            <div className="value-card"><h3>قارني الخامة</h3><p>الوزن، العرض، المرونة، الشفافية والتشطيب؛ خمس قراءات تكفي لتجنّب المفاجآت.</p></div>
          </article>
          <article className="glass-card">
            <span className="chip">الخطوة ٣</span>
            <div className="value-card"><h3>احسبي الكمية</h3><p>أضيفي هامشاً للقص والخياطة، ثم اطلبي نصف متر كبداية وزيدي عند الحاجة.</p></div>
          </article>
        </section>

        <section className="section-block" aria-labelledby="guide-faq-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">أسئلة تتكرر</span>
              <h2 id="guide-faq-title">أسئلة وإجابات سريعة</h2>
              <p>افتحي أي سؤال لتظهر الإجابة كاملة دون مغادرة الصفحة.</p>
            </div>
            <Link href="/contact" className="underlined-link">سؤال آخر؟ راسلينا <ArrowLeft size={15} /></Link>
          </div>
          <div className="guide-grid">
            {questions.map((item, index) => (
              <details className="guide-card" key={item.question} open={index === 0}>
                <summary>
                  <span>{index + 1 < 10 ? `٠${index + 1}` : index + 1}</span>
                  <strong>{item.question}</strong>
                  <ChevronDown size={18} />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section-soft" aria-labelledby="guide-tips-title">
          <div className="section-head-tight">
            <div>
              <span className="eyebrow">جدول عملي</span>
              <h2 id="guide-tips-title">نصائح اختيار القماش حسب القطعة</h2>
              <p>مرجع سريع تراجعينه قبل إضافة أي خامة إلى السلة.</p>
            </div>
            <span className="chip"><Layers size={13} />٦ حالات شائعة</span>
          </div>
          <div className="tips-table-wrap" role="region" aria-label="جدول نصائح اختيار القماش حسب القطعة" tabIndex={0}>
            <table className="tips-table">
              <caption>اخترِي صفّ قطعتك ثم اقرئي الخامة والوزن والملاحظة.</caption>
              <thead>
                <tr>
                  <th scope="col">القطعة</th>
                  <th scope="col">الخامة المقترحة</th>
                  <th scope="col">الوزن</th>
                  <th scope="col">ملاحظة القياس</th>
                </tr>
              </thead>
              <tbody>
                {fabricTips.map((row) => (
                  <tr key={row.use}>
                    <th scope="row">{row.use}</th>
                    <td>{row.fabric}</td>
                    <td>{row.weight}</td>
                    <td>{row.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="table-hint">اسحبي الجدول أفقياً لعرض بقية الأعمدة.</p>
        </section>

        <section className="section-block" aria-labelledby="guide-quality-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">فحص سريع</span>
              <h2 id="guide-quality-title">علامات خامة جيدة</h2>
              <p>ست نقاط تراجعينها على العينة قبل إتمام الطلب.</p>
            </div>
          </div>
          <ul className="guide-checklist">
            {qualityChecks.map((item) => <li key={item}><Check size={15} />{item}</li>)}
          </ul>
          <div className="chip-row" style={{ marginTop: '22px' }}>
            <span className="chip"><Scissors size={13} />قصّ بسيط</span>
            <span className="chip"><Heart size={13} />عناية بالمطرز</span>
            <span className="chip"><Clock size={13} />رد خلال ساعات العمل</span>
            <span className="chip"><ShieldCheck size={13} />فحص قبل الشحن</span>
          </div>
        </section>

        <div className="center-action">
          <Link href="/catalog" className="button button-primary">ابدئي من المعرض <ArrowLeft size={16} /></Link>
        </div>
      </main>
    </>
  )
}
interface ContactErrors {
  name?: string
  phone?: string
  message?: string
}

const validIraqiPhone = (value: string): boolean => /^(?:07\d{9}|9647\d{9}|\+9647\d{9})$/.test(value.replace(/[\s()-]/g, ''))

export function ContactPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<ContactErrors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'whatsapp'>('idle')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [tabOpened, setTabOpened] = useState(false)

  const composeText = (): string => `مرحباً إيفا ستور،${'\n'}الاسم: ${name.trim()}${'\n'}الهاتف: ${phone.trim()}${'\n'}${message.trim()}`

  const validate = (): boolean => {
    const next: ContactErrors = {}
    const cleanName = name.trim()
    const cleanPhone = phone.replace(/[\s()-]/g, '')
    const cleanMessage = message.trim()
    if (cleanName.length < 3) next.name = 'اكتبي اسمك من ٣ أحرف على الأقل'
    else if (!/[ء-يA-Za-z]/.test(cleanName)) next.name = 'اكتبي اسمك بالحروف العربية أو اللاتينية'
    if (!validIraqiPhone(cleanPhone)) next.phone = 'أدخلي رقم هاتف عراقي صحيحاً يبدأ بـ 07'
    if (cleanMessage.length < 10) next.message = 'اكتبي رسالة من ١٠ أحرف على الأقل حتى نساعدك بدقة'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const openWhatsApp = (url: string) => {
    setWhatsappUrl(url)
    setState('whatsapp')
    let handle: Window | null = null
    try {
      handle = window.open(url, '_blank')
    } catch {
      handle = null
    }
    setTabOpened(Boolean(handle))
    if (!handle) window.location.href = url
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setState('sending')
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 4500)
    try {
      const response = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.replace(/[\s()-]/g, ''), message: message.trim() }),
        signal: controller.signal,
      })
      const contentType = response.headers.get('content-type') || ''
      if (!response.ok || !contentType.includes('json')) throw new Error('contact-endpoint-unavailable')
      await response.json().catch(() => null)
      setState('sent')
    } catch {
      window.clearTimeout(timer)
      openWhatsApp(composeText())
      return
    }
    window.clearTimeout(timer)
  }

  const reset = () => {
    setName('')
    setPhone('')
    setMessage('')
    setErrors({})
    setState('idle')
    setWhatsappUrl('')
  }

  return (
    <>
      <GlassStyles />
      <main className="container-eva info-page">
        <div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>›</span><span>تواصلي معنا</span></div>

        <section className="contact-layout">
          <div className="contact-intro">
            <span className="eyebrow"><MessageCircle size={14} />نحن قريبون</span>
            <h1>سؤال عن خامة أو طلب؟</h1>
            <p>اكتبي لنا ما يدور في بالك. إن تعذّر إرسال الرسالة من الموقع مباشرة، نحوّلها تلقائياً إلى محادثة واتساب مكتوبة برسالتك نفسها.</p>

            <div className="contact-methods">
              <a href={siteConfig.whatsappUrl()} target="_blank" rel="noreferrer" aria-label="فتح محادثة واتساب مع إيفا ستور">
                <MessageCircle size={19} /><span><strong>واتساب</strong><small dir="ltr">{siteConfig.phone}</small></span><ArrowLeft size={15} />
              </a>
              <a href={`tel:${siteConfig.phone}`} aria-label={`الاتصال على ${siteConfig.phone}`}>
                <Phone size={19} /><span><strong>اتصال هاتفي</strong><small dir="ltr">{siteConfig.phone}</small></span><ArrowLeft size={15} />
              </a>
              <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer" aria-label={siteConfig.instagramText}>
                <Instagram size={19} /><span><strong>إنستغرام</strong><small>راسلينا أو شاهدي أحدث القطع</small></span><ArrowLeft size={15} />
              </a>
            </div>

            <div className="contact-hours glass-card">
              <span className="hours-title"><Clock size={15} />أوقات العمل</span>
              <div className="hours-row"><span>السبت إلى الخميس</span><strong>١٠:٠٠ ص – ١٠:٠٠ م</strong></div>
              <div className="hours-row"><span>الجمعة</span><strong>٤:٠٠ م – ١٠:٠٠ م</strong></div>
              <div className="hours-row"><span>رسائل واتساب</span><strong>نردّ خلال ساعات العمل</strong></div>
            </div>

            <div className="map-card glass-dark">
              <span className="map-grid" aria-hidden="true" />
              <div className="map-copy">
                <span className="map-pin"><MapPin size={18} /></span>
                <strong>الموقع والعنوان</strong>
                <p>بغداد نستقبل الطلبات عبر المتجر أونلاين، ونرتّب موعد الاستلام بعد تأكيد الطلب. التوصيل يشمل جميع المحافظات العراقية، وللعنوان التفصيلي نرسله لك عند التأكيد.</p>
              </div>
              <a className="button button-light" href={siteConfig.whatsappUrl('مرحباً إيفا، أرجو إرسال موقع المعرض وساعات العمل')} target="_blank" rel="noreferrer">اطلبي الموقع على الخريطة <ArrowLeft size={16} /></a>
            </div>
          </div>

          <form className="contact-form glass" onSubmit={submit} noValidate>
            <div className="section-head-tight" style={{ marginBottom: '18px' }}>
              <div>
                <span className="eyebrow"><Send size={14} />راسلينا</span>
                <h2>أرسلي رسالتك</h2>
              </div>
              <span className="chip chip-neutral">رد خلال ٢٤ ساعة</span>
            </div>

            <div className="form-fields">
              <div className="field">
                <label htmlFor="contact-name">الاسم <small>(مطلوب)</small></label>
                <input id="contact-name" className="glass-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="كيف نناديك؟" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
                {errors.name && <small className="field-error" id="contact-name-error">{errors.name}</small>}
              </div>
              <div className="field">
                <label htmlFor="contact-phone">رقم الهاتف <small>(مطلوب)</small></label>
                <input id="contact-phone" className="glass-input" type="tel" dir="ltr" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="07XXXXXXXXX" autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'contact-phone-error' : undefined} />
                {errors.phone && <small className="field-error" id="contact-phone-error">{errors.phone}</small>}
              </div>
              <div className="field">
                <label htmlFor="contact-message">الرسالة <small>(مطلوب)</small></label>
                <textarea id="contact-message" className="glass-input" rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="اكتبي سؤالك أو نوع الخامة التي تبحثين عنها" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
                {errors.message && <small className="field-error" id="contact-message-error">{errors.message}</small>}
              </div>
            </div>

            {state === 'idle' || state === 'sending' ? (
              <button type="submit" className="button button-primary" disabled={state === 'sending'}>
                {state === 'sending' ? 'جارٍ إرسال الرسالة' : <>إرسال الرسالة <Send size={16} /></>}
              </button>
            ) : null}

            {state === 'sent' && (
              <div className="form-status form-status-success" role="status">
                <Check size={16} />
                <span>وصلتنا رسالتك وسنتواصل معك عبر رقم الهاتف الذي أدخلتيه. إن أحببتِ البدء مباشرة، يمكننا متابعة المحادثة على واتساب.</span>
              </div>
            )}

            {state === 'whatsapp' && (
              <div className="form-status form-status-info" role="status">
                <MessageCircle size={16} />
                <span>
                  {tabOpened ? 'فتحنا محادثة واتساب برسالتك جاهزة. وإن لم تظهر المحادثة، اضغطي الزر.' : 'تعذّر إرسال الرسالة من الموقع، فحوّلناها إلى واتساب. اضغطي الزر لإتمام المحادثة.'}
                  {' '}<a href={whatsappUrl} target="_blank" rel="noreferrer">فتح محادثة واتساب</a>
                </span>
              </div>
            )}

            {state !== 'idle' && (
              <div className="form-actions">
                <button type="button" className="button button-outline" onClick={reset}>كتابة رسالة أخرى</button>
                <Link href="/catalog" className="button button-primary">تصفحي الأقمشة <ArrowLeft size={16} /></Link>
              </div>
            )}

            <p className="form-footnote">نستخدم بياناتك للتواصل بشأن استفسارك فقط، ويمكنك مراجعة تفاصيل ذلك في <Link href="/policies#privacy">سياسة الخصوصية</Link>.</p>
          </form>
        </section>
      </main>
    </>
  )
}
interface PolicyContent {
  id: string
  title: string
  intro: string
  points: string[]
  note: string
}

const policies: PolicyContent[] = [
  {
    id: 'terms',
    title: 'شروط الاستخدام',
    intro: 'باستخدامك موقع إيفا ستور فإنك تقرّين بصحة البيانات التي تدخلينها وأن الهدف من الموقع هو طلب المنتجات المتاحة لدينا.',
    points: [
      'الأسعار والمواصفات والألوان قابلة للتحديث، ويظهر السعر النهائي في مراجعة الطلب قبل التأكيد.',
      'كمية القماش تُحسب بالمتر ونصف المتر، والمخزون يُخصم عند تأكيد الطلب لا عند إضافته إلى السلة.',
      'يحق لنا التواصل معك للتأكيد عبر الهاتف أو واتساب قبل الشحن، ويُعد الطلب مؤكداً بعد هذا التواصل.',
      'يُمنع إعادة بيع المنتجات أو استخدام صور المتجر دون إذن مكتوب.',
    ],
    note: 'بإرسال الطلب توافقين على هذه الشروط وعلى سياسة الإرجاع.',
  },
  {
    id: 'privacy',
    title: 'سياسة الخصوصية',
    intro: 'نستخدم البيانات التي تدخلينها لتنفيذ طلبك والتواصل معك بشأنه فقط، ونلتزم بعدم مشاركتها مع جهات غير ضرورية.',
    points: [
      'نجمع الاسم ورقم الهاتف والعنوان وتفاصيل الطلب اللازمة للتنفيذ.',
      'البريد الإلكتروني والملاحظات اختيارية ولا يشترط لإتمام الطلب.',
      'لا نحفظ بيانات الدفع، لأن الدفع يتم عند الاستلام في العراق.',
      'يمكنك طلب عرض بياناتك أو حذفها في أي وقت عبر واتساب، وسنستجيب خلال أيام العمل.',
    ],
       note: 'لن نرسل رسائل تسويقية دون موافقتك الصريحة.',
  },
  {
    id: 'shipping',
    title: 'الشحن والتوصيل',
    intro: 'نجهّز الطلبات بعد التأكيد، ويظهر رقم الطلب في صفحة النجاح ويُرسل لك مع تحديثات الشحن.',
    points: [
      'التوصيل متاح إلى جميع المحافظات العراقية، ويعتمد الوقت على بعد المحافظة وحالة الطلب.',
      'رسوم الشحن تُحتسب في مراجعة الطلب، وتصبح مجانية للطلبات التي تتجاوز ٥٠٬٠٠٠ دينار.',
      'الشحن الدولي متاح عند توفّر شحنة مناسبة، ويُتفق على التفاصيل قبل الدفع.',
      'نحدّثك عبر واتساب عند خروج الطلب وعند تسليمه إلى مندوب الشحن.',
    ],
    note: 'احتفظي برقم الطلب؛ فهو يكفي للاستفسار دون مشاركة بيانات إضافية.',
  },
  {
    id: 'returns',
    title: 'الإرجاع والتبديل',
    intro: 'نقبل الإرجاع أو التبديل خلال ٤٨ ساعة من الاستلام إذا وصل القماش مختلفاً عن المواصفات أو حدث خطأ في التنفيذ.',
    points: [
      'يجب أن يبقى القماش بحالته الأصلية وغير مقصوص ولا مستعمل.',
      'الأقمشة المقصوصة حسب الطلب أو المقطوعة حسب القياس غير قابلة للإرجاع.',
      'في حال ثبوت خطأ منّا نتحمل رسوم الإرجاع ونشحن البديل على حسابنا.',
      'التواصل الأول يتم عبر واتساب مع إرفاق صورة للقماش ورقم الطلب.',
    ],
    note: 'اللون المطابق للصور مضمون، والاختلاف البسيط تحت الإضاءة لا يُعد عيباً.',
  },
]

export function PoliciesPage() {
  const [location] = useLocation()
  const [active, setActive] = useState<string | null>('terms')

  useEffect(() => {
    const fromRouter = location.includes('#') ? location.slice(location.indexOf('#') + 1) : ''
    const rawHash = typeof window !== 'undefined' ? window.location.hash : ''
    const fromHash = rawHash.includes('#') ? rawHash.slice(rawHash.lastIndexOf('#') + 1) : ''
    const target = [fromRouter, fromHash].find((value) => policies.some((item) => item.id === value))
    if (!target) return undefined
    setActive(target)
    const frame = window.requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: 'start' }))
    return () => window.cancelAnimationFrame(frame)
  }, [location])

  const openPolicy = (id: string) => {
    setActive(id)
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 60)
  }

  return (
    <>
      <GlassStyles />
      <main className="container-eva info-page policies-page">
        <div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>›</span><span>السياسات</span></div>

        <section className="info-heading">
          <span className="eyebrow"><ShieldCheck size={14} />واضحة منذ البداية</span>
          <h1>سياسات المتجر</h1>
          <p>أربعة بنود تقرأينها مرة واحدة قبل إتمام الطلب: الاستخدام، الخصوصية، الشحن، والإرجاع. اضغطي على أي بند لفتحه.</p>
        </section>

        <div className="policy-nav" role="group" aria-label="الانتقال إلى بند من السياسات">
          {policies.map((item) => <button type="button" key={item.id} className="chip" onClick={() => openPolicy(item.id)}>{item.title}</button>)}
        </div>

        <div className="policy-accordions">
          {policies.map((item, index) => (
            <details className="glass-card policy-accordion" id={item.id} key={item.id} open={active === item.id}>
              <summary onClick={(event) => { event.preventDefault(); setActive(active === item.id ? null : item.id) }} aria-expanded={active === item.id}>
                <span>٠{index + 1}</span>
                <strong>{item.title}</strong>
                <ChevronDown size={18} />
              </summary>
              <div className="policy-body">
                <p>{item.intro}</p>
                <ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul>
                <p className="policy-highlight"><ShieldCheck size={15} />{item.note}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="center-action">
          <Link href="/contact" className="button button-primary">لديك سؤال آخر؟ تواصلي معنا <ArrowLeft size={16} /></Link>
        </div>
      </main>
    </>
  )
}
interface StoredOrderItem {
  name: string
  color?: string
  length?: number
  total?: number
}

interface StoredOrder {
  orderNumber: string
  status?: string
  createdAt?: string
  customerName?: string
  phone?: string
  address?: string
  subtotal?: number
  deliveryFee?: number
  total?: number
  items?: StoredOrderItem[]
}

const ORDER_KEYS = ['eva-orders', 'eva-order', 'eva-last-order', 'eva-fabrics-orders', 'eva-fabrics-order', 'eva-checkout-order', 'eva-pending-order', 'eva-order-number']

const statusSteps = ['تم استلام الطلب', 'قيد المراجعة', 'جاهز للشحن', 'في الطريق إليك', 'تم التوصيل']

const readText = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return ''
}

const readNumber = (record: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[^\d.-]/g, ''))
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return undefined
}

const looksLikeReference = (value: string): boolean => value.length >= 3 && value.length <= 40 && /^[\wء-ي-]+$/.test(value) && /\d/.test(value) && /[ء-يA-Za-z-]/.test(value)

const readItems = (value: unknown): StoredOrderItem[] => {
  if (!Array.isArray(value)) return []
  const items: StoredOrderItem[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const name = readText(record, ['productName', 'name', 'title', 'item'])
    if (!name) continue
    const item: StoredOrderItem = { name }
    const color = readText(record, ['colorName', 'color'])
    const length = readNumber(record, ['quantity', 'length', 'meters'])
    const total = readNumber(record, ['totalPrice', 'total', 'price'])
    if (color) item.color = color
    if (length !== undefined) item.length = length
    if (total !== undefined) item.total = total
    items.push(item)
  }
  return items
}

const orderFromRecord = (record: Record<string, unknown>, fallbackNumber: string): StoredOrder | null => {
  const orderNumber = readText(record, ['orderNumber', 'order_number', 'orderNo', 'number', 'reference', 'ref', 'orderId', 'order_id', 'id']) || fallbackNumber
  if (!orderNumber) return null
  const order: StoredOrder = { orderNumber }
  const status = readText(record, ['status', 'state', 'orderStatus', 'stage'])
  const createdAt = readText(record, ['createdAt', 'created_at', 'date', 'timestamp', 'updatedAt'])
  const customerName = readText(record, ['customerName', 'name', 'fullName'])
  const phone = readText(record, ['phone', 'customerPhone', 'mobile'])
  const address = readText(record, ['address', 'shippingAddress', 'deliveryAddress'])
  const items = readItems(record.items)
  const subtotal = readNumber(record, ['subtotal'])
  const deliveryFee = readNumber(record, ['deliveryFee', 'shipping', 'shippingFee'])
  const total = readNumber(record, ['total', 'grandTotal', 'amount'])
  if (status) order.status = status
  if (createdAt) order.createdAt = createdAt
  if (customerName) order.customerName = customerName
  if (phone) order.phone = phone
  if (address) order.address = address
  if (items.length) order.items = items
  if (subtotal !== undefined) order.subtotal = subtotal
  if (deliveryFee !== undefined) order.deliveryFee = deliveryFee
  if (total !== undefined) order.total = total
  return order
}

const collectOrders = (value: unknown, out: StoredOrder[]): void => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (looksLikeReference(trimmed)) out.push({ orderNumber: trimmed })
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectOrders(item, out)
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as Record<string, unknown>
  if (Array.isArray(record.orders)) {
    collectOrders(record.orders, out)
    return
  }
  const direct = orderFromRecord(record, '')
  if (direct) {
    out.push(direct)
    return
  }
  for (const [key, child] of Object.entries(record)) {
    if (child && typeof child === 'object') {
      const childRecord = child as Record<string, unknown>
      const childOrder = orderFromRecord(childRecord, '')
      if (childOrder) {
        out.push(childOrder)
        continue
      }
      if (looksLikeReference(key)) {
        const withKey = orderFromRecord(childRecord, key)
        if (withKey) out.push(withKey)
        continue
      }
      collectOrders(child, out)
      continue
    }
    if (typeof child === 'string' && looksLikeReference(child) && !['status', 'state', 'message'].includes(key)) out.push({ orderNumber: child })
  }
}

const readOrders = (): StoredOrder[] => {
  if (typeof window === 'undefined') return []
  const collected: StoredOrder[] = []
  for (const key of ORDER_KEYS) {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      collectOrders(JSON.parse(raw), collected)
    } catch {
      continue
    }
  }
  const seen = new Set<string>()
  return collected.filter((order) => {
    const id = order.orderNumber.toLowerCase()
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

const rememberOrder = (order: StoredOrder): void => {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem('eva-orders')
    const existing: StoredOrder[] = []
    if (raw) collectOrders(JSON.parse(raw), existing)
    const next = [order, ...existing.filter((item) => item.orderNumber.toLowerCase() !== order.orderNumber.toLowerCase())].slice(0, 12)
    window.localStorage.setItem('eva-orders', JSON.stringify(next))
  } catch {
    return
  }
}

const findOrder = (orders: StoredOrder[], number: string): StoredOrder | undefined => {
  const needle = number.trim().toLowerCase()
  if (!needle) return undefined
  return orders.find((order) => order.orderNumber.trim().toLowerCase() === needle)
}

const statusIndex = (status?: string): number => {
  const value = normalizeArabic(status || '')
  if (!value) return 0
  if (value.includes('الغ') || value.includes('ملغي') || value.includes('cancel')) return -1
  if (value.includes('طريق') || value.includes('شحن') || value.includes('قيد التوصيل') || value.includes('ship') || value.includes('dispatch')) return 3
  if (value.includes('تسليم') || value.includes('توصيل') || value.includes('وصل') || value.includes('deliver')) return 4
  if (value.includes('تجهيز') || value.includes('جاهز') || value.includes('pack') || value.includes('prepare')) return 2
  if (value.includes('راجع') || value.includes('تأكيد') || value.includes('review') || value.includes('pending') || value.includes('confirm')) return 1
  return 0
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  try {
    return date.toLocaleString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return value
  }
}
function OrderStatusPanel({ order }: { order: StoredOrder }) {
  const index = statusIndex(order.status)
  const cancelled = index < 0
  const step = cancelled ? 0 : index
  return (
    <section className="status-panel glass-dark" aria-label="حالة الطلب">
      <div className="status-head">
        <span>{cancelled ? 'حالة الطلب' : 'آخر تحديث'}</span>
        <strong>{cancelled ? 'تم إلغاء الطلب' : order.status || statusSteps[step]}</strong>
        {order.createdAt && <small>تاريخ التسجيل: {formatDate(order.createdAt)}</small>}
      </div>
      <ol className="status-steps">
        {statusSteps.map((label, position) => (
          <li key={label} className={!cancelled && position <= step ? 'is-done' : undefined}>
            <span>{!cancelled && position <= step ? <Check size={14} /> : position + 1}</span>
            <div>
              <strong>{label}</strong>
              <small>{!cancelled && position < step ? 'مكتمل' : !cancelled && position === step ? 'الوضع الحالي' : 'لاحقاً'}</small>
            </div>
          </li>
        ))}
      </ol>
      {order.items && order.items.length > 0 && (
        <div className="status-items">
          <span>عناصر الطلب</span>
          {order.items.map((item, position) => (
            <div className="status-item" key={`${item.name}-${position}`}>
              <b>{item.name}{item.color ? ` · ${item.color}` : ''}</b>
              <span>{item.length ? formatMeters(item.length) : ''}{item.total ? ` · ${formatPrice(item.total)}` : ''}</span>
            </div>
          ))}
        </div>
      )}
      <div className="order-meta">
        {order.total !== undefined && <span className="chip chip-dark">الإجمالي: {formatPrice(order.total)}</span>}
        {order.customerName && <span className="chip chip-dark">{order.customerName}</span>}
        {order.address && <span className="chip chip-dark">{order.address}</span>}
      </div>
    </section>
  )
}

export function OrderConfirmationPage({ orderNumber }: { orderNumber: string }) {
  const trimmed = orderNumber.trim()
  const orders = useMemo(readOrders, [])
  const stored = useMemo(() => (trimmed ? findOrder(orders, trimmed) : undefined), [orders, trimmed])
  const fallback = useMemo<StoredOrder | undefined>(() => (trimmed ? { orderNumber: trimmed, createdAt: new Date().toISOString(), status: statusSteps[0] } : undefined), [trimmed])
  const order = stored || fallback

  useEffect(() => {
    if (!trimmed || stored || !fallback) return undefined
    rememberOrder(fallback)
    return undefined
  }, [trimmed, stored, fallback])

  if (!order) {
    return (
      <>
        <GlassStyles />
        <main className="container-eva confirmation-page">
          <section className="order-empty glass">
            <div className="empty-icon"><PackageCheck size={25} /></div>
            <h1>لا يوجد طلب لعرضه</h1>
            <p>لم يصلنا رقم طلب في هذا الرابط. افتحي رسالة التأكيد التي وصلك، أو ابحثي عن طلبك برقم الطلب.</p>
            <div className="empty-actions">
              <Link href="/order-tracking" className="button button-primary">تتبّع الطلب <ArrowLeft size={16} /></Link>
              <a href={siteConfig.whatsappUrl('مرحباً إيفا، أحتاج مساعدة في الطلب')} target="_blank" rel="noreferrer" className="button button-outline"><MessageCircle size={16} />تواصلي معنا</a>
            </div>
          </section>
        </main>
      </>
    )
  }

  return (
    <>
      <GlassStyles />
      <main className="container-eva confirmation-page">
        <div className="glass glass-card confirmation-panel">
          <div className="confirmation-mark"><Check size={30} /></div>
          <span className="eyebrow">تم استلام طلبك</span>
          <h1>شكراً لاختيارك إيفا.</h1>
          <p>سنراجع تفاصيل طلبك ونتواصل معك لتأكيد التوصيل. احتفظي برقم الطلب لمتابعة حالته في أي وقت.</p>
          <div className="confirmation-number"><small>رقم الطلب</small><strong dir="ltr">{order.orderNumber}</strong></div>
          <OrderStatusPanel order={order} />
          <div className="confirmation-actions">
            <Link href="/catalog" className="button button-primary">متابعة التسوق <ArrowLeft size={16} /></Link>
            <Link href={`/order-tracking?order=${encodeURIComponent(order.orderNumber)}`} className="button button-outline"><Search size={16} />تتبّع الطلب</Link>
            <a href={siteConfig.whatsappUrl(`مرحباً، أستفسر عن الطلب رقم ${order.orderNumber}`)} target="_blank" rel="noreferrer" className="button button-outline"><MessageCircle size={16} />تواصلي عبر واتساب</a>
          </div>
          <div className="confirmation-trust"><Truck size={17} /><span>التوصيل مجاني للطلبات التي تتجاوز ٥٠٬٠٠٠ دينار، ونحدّث الحالة عبر واتساب.</span></div>
        </div>
      </main>
    </>
  )
}

export function OrderTrackingPage() {
  const [location, navigate] = useLocation()
  const query = new URLSearchParams(location.includes('?') ? location.slice(location.indexOf('?') + 1) : '')
  const currentOrder = query.get('order') || ''
  const [value, setValue] = useState(currentOrder)
  const [submitted, setSubmitted] = useState(currentOrder)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const orders = useMemo(readOrders, [version])

  useEffect(() => {
    if (!currentOrder) return undefined
    setValue(currentOrder)
    setSubmitted(currentOrder)
    return undefined
  }, [currentOrder])

  const active = submitted || currentOrder
  const match = active ? findOrder(orders, active) : undefined

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const clean = value.trim()
    if (!clean) {
      setError('أدخلي رقم الطلب الذي وصلك بعد التأكيد')
      return
    }
    setError('')
    setSubmitted(clean)
    navigate(`/order-tracking?order=${encodeURIComponent(clean)}`)
  }

  return (
    <>
      <GlassStyles />
      <main className="container-eva info-page">
        <div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>›</span><span>تتبّع الطلب</span></div>

        <section className="tracking-card glass">
          <div className="tracking-icon"><PackageCheck size={28} /></div>
          <span className="eyebrow">تحديث رحلتك</span>
          <h1>تتبّع الطلب</h1>
          <p>أدخلي رقم الطلب الذي استلمته بعد التأكيد. إن لم يكن لديك رقم بعد، تواصلي معنا وسنبحث عنه بالهاتف.</p>

          <form className="tracking-form" onSubmit={submit} noValidate>
            <label className="sr-only" htmlFor="tracking-order">رقم الطلب</label>
            <Search size={18} />
            <input id="tracking-order" value={value} onChange={(event) => setValue(event.target.value)} placeholder="مثال: EVA-1024" dir="ltr" aria-invalid={Boolean(error)} aria-describedby={error ? 'tracking-error' : undefined} />
            <button type="submit" className="button button-primary">عرض الحالة</button>
          </form>

          {error && <p className="field-error" id="tracking-error" role="alert">{error}</p>}

          {active && match && (
            <>
              <OrderStatusPanel order={match} />
              <div className="local-orders">
                <span>بحثتِ عن:</span>
                <span className="chip" dir="ltr">{match.orderNumber}</span>
                <button type="button" className="chip" onClick={() => setVersion((current) => current + 1)}><RotateCcw size={13} />تحديث القائمة</button>
              </div>
            </>
          )}

          {active && !match && (
            <div className="tracking-result-glass form-status-error" role="status">
              <Search size={18} />
              <div>
                <strong>لم نعثر على طلب بالرقم {active}</strong>
                <p>تأكدي من الرقم كما وصل في رسالة التأكيد، أو ابحثي في الطلبات المحفوظة على هذا الجهاز.</p>
              </div>
            </div>
          )}

          {!active && orders.length === 0 && (
            <section className="order-empty glass">
              <div className="empty-icon"><Search size={25} /></div>
              <h1>لا توجد طلبات محفوظة بعد</h1>
              <p>عند إتمام أول طلب يُحفظ رقم الطلب هنا تلقائياً لتتبعي حالته بدون تسجيل دخول.</p>
              <div className="empty-actions">
                <Link href="/catalog" className="button button-primary">تصفحي الأقمشة <ArrowLeft size={16} /></Link>
                <Link href="/contact" className="button button-outline">تواصلي معنا <ArrowLeft size={16} /></Link>
              </div>
            </section>
          )}

          {!active && orders.length > 0 && (
            <div className="local-orders">
              <span>طلبات محفوظة على هذا الجهاز:</span>
              {orders.slice(0, 5).map((order) => (
                <button type="button" key={order.orderNumber} className="chip" dir="ltr" onClick={() => { setValue(order.orderNumber); setSubmitted(order.orderNumber); setError('') }}>{order.orderNumber}</button>
              ))}
            </div>
          )}

          <a href={siteConfig.whatsappUrl(`مرحباً، أريد الاستفسار عن الطلب رقم ${active || ''}`)} target="_blank" rel="noreferrer" className="button button-outline"><MessageCircle size={16} />اسألينا عبر واتساب</a>
        </section>
      </main>
    </>
  )
}

