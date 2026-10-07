import {
  CATEGORIES,
  CategorySchema,
  GOVERNORATES,
  GovernorateSchema,
  ProductSchema,
  SITE_ROUTES,
  SiteRouteSchema,
  type Category,
  type Governorate,
  type Product,
  type SiteRoute,
} from "./schemas";

export const seedCategories: readonly Category[] = CATEGORIES.map((category) =>
  CategorySchema.parse(category),
);

export const seedGovernorates: readonly Governorate[] = GOVERNORATES.map(
  (governorate) => GovernorateSchema.parse(governorate),
);

export const seedRoutes: readonly SiteRoute[] = SITE_ROUTES.map((route) =>
  SiteRouteSchema.parse(route),
);

export const seedProducts: readonly Product[] = [];

export function findCategory(
  value: string,
  categories: readonly Category[] = seedCategories,
): Category | undefined {
  const normalized = value.trim().toLowerCase();
  return categories.find(
    (category) =>
      category.id.toLowerCase() === normalized ||
      category.slug.toLowerCase() === normalized ||
      category.name === value.trim(),
  );
}

export function findGovernorate(
  value: string,
  governorates: readonly Governorate[] = seedGovernorates,
): Governorate | undefined {
  const normalized = value.trim().toLowerCase();
  return governorates.find(
    (governorate) =>
      governorate.id.toLowerCase() === normalized ||
      governorate.name === value.trim(),
  );
}
