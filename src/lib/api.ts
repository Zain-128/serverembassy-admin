export type StaffUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active?: boolean;
};

export type ApiProduct = {
  id: string;
  sku: string;
  slug: string;
  title: string;
  brandId: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  weightLbs?: number;
  condition?: string;
  warranty?: string;
  description?: string;
  featured?: boolean;
  isDeal?: boolean;
  dealEndsAt?: string | null;
  status?: string;
  published?: boolean;
  link?: string;
  gtin?: string;
  mpn?: string;
  googleProductCategory?: string;
  customLabel0?: string;
  shipping?: string;
  tax?: string;
  images?: Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>;
};

export type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
  description?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  showOnHomepage?: boolean;
  sortOrder?: number;
};

export type ApiBrand = {
  id: string;
  slug: string;
  name: string;
  featured?: boolean;
};

export type ApiBanner = {
  id: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  href: string;
  size?: string;
  sortOrder?: number;
  active?: boolean;
};

export type ApiCmsPage = {
  id: string;
  slug: string;
  title: string;
  body: string;
  published?: boolean;
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  total: number;
  subtotal?: number;
  placedAt?: string;
  createdAt?: string;
  items?: Array<{ sku: string; qty: number; unitPrice: number; title?: string }>;
  shipments?: Array<{ carrier: string; trackingNumber: string }>;
  billingAddress?: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
};

export type ApiQuote = {
  id: string;
  name: string;
  email: string;
  company?: string;
  partNumber?: string;
  quantity?: number;
  targetPrice?: number;
  status: string;
};

export type ApiCustomer = {
  id: string;
  fullName?: string;
  email: string;
  company?: string;
  taxExempt: string;
  orderCount?: number;
};

export type ApiSettings = {
  storeName?: string;
  tagline?: string;
  phone?: string;
  supportEmail?: string;
  address?: string;
  hours?: string;
  freeShippingThreshold?: number;
  freeShippingLabel?: string;
  taxRate?: number;
  currency?: string;
};

export type ApiCoupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
  maxDiscount?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount?: number;
  active?: boolean;
};

export type ApiContactMessage = {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read?: boolean;
  createdAt?: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function productToApi(form: {
  sku: string;
  slug: string;
  title: string;
  brandId: string;
  categoryId: string;
  price: number;
  stock: number;
  weightLbs?: number;
  condition?: string;
  warranty?: string;
  description?: string;
  featured?: boolean;
  deal?: boolean;
  published?: boolean;
  link?: string;
  gtin?: string;
  mpn?: string;
  googleProductCategory?: string;
  customLabel0?: string;
  shipping?: string;
  tax?: string;
  imageLink?: string;
}) {
  const conditionMap: Record<string, string> = {
    New: "new",
    "Certified Refurbished": "certified_refurbished",
  };
  return {
    sku: form.sku,
    slug: form.slug || form.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: form.title,
    brandId: form.brandId,
    categoryId: form.categoryId,
    price: form.price,
    stock: form.stock,
    weightLbs: form.weightLbs ?? 1,
    condition: conditionMap[form.condition ?? "New"] ?? "new",
    warranty: form.warranty ?? "30 Days",
    description: form.description ?? "",
    featured: form.featured ?? false,
    isDeal: form.deal ?? false,
    status: form.published !== false ? "published" : "draft",
    link: form.link ?? "",
    gtin: form.gtin ?? "",
    mpn: form.mpn ?? "",
    googleProductCategory: form.googleProductCategory ?? "",
    customLabel0: form.customLabel0 ?? "",
    shipping: form.shipping ?? "",
    tax: form.tax ?? "",
    images: form.imageLink
      ? [
          {
            url: form.imageLink,
            altText: form.title,
            sortOrder: 0,
            isPrimary: true,
          },
        ]
      : [],
  };
}

export function productFromApi(p: ApiProduct) {
  const conditionMap: Record<string, string> = {
    new: "New",
    certified_refurbished: "Certified Refurbished",
    used: "Used",
  };
  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    title: p.title,
    brandId: p.brandId,
    categoryId: p.categoryId,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    stock: p.stock,
    weightLbs: p.weightLbs ?? 1,
    condition: conditionMap[p.condition ?? "new"] ?? "New",
    warranty: p.warranty ?? "30 Days",
    rating: 0,
    reviewCount: 0,
    description: p.description ?? "",
    features: [] as string[],
    specs: [] as { label: string; value: string }[],
    featured: p.featured ?? false,
    deal: p.isDeal ?? false,
    dealEndsAt: p.dealEndsAt ?? null,
    published: p.published ?? p.status === "published",
    link: p.link ?? "",
    gtin: p.gtin ?? "",
    mpn: p.mpn ?? "",
    googleProductCategory: p.googleProductCategory ?? "",
    customLabel0: p.customLabel0 ?? "",
    shipping: p.shipping ?? "",
    tax: p.tax ?? "",
    imageLink: p.images?.[0]?.url ?? "",
  };
}
