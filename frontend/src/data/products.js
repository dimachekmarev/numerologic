// Shared catalog: backend/catalog.json is the source of truth.
import catalog from "../../../backend/catalog.json";
export const products = catalog.products;
export const addons = [];
export const productBySlug = (slug) =>
  products.find((product) => product.slug === slug);
export const addonBySlug = () => undefined;
export const formatPrice = (amount) =>
  new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
