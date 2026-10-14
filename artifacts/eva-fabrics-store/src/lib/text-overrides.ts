/**
 * تجاوزات نصوص النظام التي تخصّصها الإدارة من لوحة التحكم.
 * تُخزَّن داخل محتوى المتجر (content.texts) وتُمرَّر هنا لتقرأها دالة الترجمة t/tr.
 */
let overrides: Record<string, string> = {}

export const setTextOverrides = (value: Record<string, string> | undefined | null): void => {
  overrides = value && typeof value === 'object' ? value : {}
}

export const getTextOverride = (key: string): string | undefined => {
  const value = overrides[key]
  return typeof value === 'string' ? value : undefined
}
