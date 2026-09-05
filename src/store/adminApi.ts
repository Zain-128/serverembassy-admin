import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type {
  ApiBanner,
  ApiBrand,
  ApiCategory,
  ApiCmsPage,
  ApiContactMessage,
  ApiCoupon,
  ApiCustomer,
  ApiOrder,
  ApiProduct,
  ApiQuote,
  ApiSettings,
  Paginated,
  StaffUser,
} from "@/lib/api";
import { logout, setCredentials, setUser } from "./authSlice";

function baseUrl() {
  return (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl()}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { token: string | null } }).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra,
) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error && result.error.status === 401) {
    const url = typeof args === "string" ? args : args.url;
    if (!url.includes("/auth/login")) {
      api.dispatch(logout());
    }
  }
  return result;
};

function toQuery(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val != null && val !== "") qs.set(key, String(val));
  });
  const query = qs.toString();
  return query ? `?${query}` : "";
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Dashboard",
    "Products",
    "Categories",
    "Brands",
    "Banners",
    "Pages",
    "Orders",
    "Quotes",
    "Customers",
    "Settings",
    "Coupons",
    "Messages",
    "Auth",
  ],
  endpoints: (builder) => ({
    login: builder.mutation<{ token: string; user: StaffUser }, { email: string; password: string }>(
      {
        query: (body) => ({ url: "/auth/login", method: "POST", body }),
        async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            dispatch(setCredentials(data));
          } catch {
            /* login error surfaced by mutation */
          }
        },
      },
    ),
    getMe: builder.query<StaffUser, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {
          dispatch(logout());
        }
      },
    }),

    getDashboard: builder.query<
      {
        productCount: number;
        orderCount: number;
        newQuotes: number;
        processingOrders: number;
        revenue: number;
      },
      void
    >({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),

    getProducts: builder.query<
      Paginated<ApiProduct>,
      { page?: number; limit?: number; q?: string } | void
    >({
      query: (params) =>
        `/admin/products${toQuery({
          page: params?.page,
          limit: params?.limit ?? 100,
          q: params?.q,
        })}`,
      providesTags: ["Products"],
    }),
    getProduct: builder.query<ApiProduct, string>({
      query: (id) => `/admin/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Products", id }],
    }),
    createProduct: builder.mutation<ApiProduct, Record<string, unknown>>({
      query: (body) => ({ url: "/admin/products", method: "POST", body }),
      invalidatesTags: ["Products", "Dashboard"],
    }),
    updateProduct: builder.mutation<ApiProduct, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/products/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Products", "Dashboard"],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Products", "Dashboard"],
    }),
    importProducts: builder.mutation<
      { created: number; updated: number; errors: Array<{ sku: string; error: string }> },
      Record<string, unknown>[]
    >({
      query: (rows) => ({ url: "/admin/products/import", method: "POST", body: { rows } }),
      invalidatesTags: ["Products", "Dashboard"],
    }),

    getCategories: builder.query<ApiCategory[], void>({
      query: () => "/admin/categories",
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation<ApiCategory, Record<string, unknown>>({
      query: (body) => ({ url: "/admin/categories", method: "POST", body }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation<ApiCategory, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Categories"],
    }),

    getBrands: builder.query<ApiBrand[], void>({
      query: () => "/admin/brands",
      providesTags: ["Brands"],
    }),
    createBrand: builder.mutation<ApiBrand, Record<string, unknown>>({
      query: (body) => ({ url: "/admin/brands", method: "POST", body }),
      invalidatesTags: ["Brands"],
    }),
    updateBrand: builder.mutation<ApiBrand, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/brands/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Brands"],
    }),
    deleteBrand: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/brands/${id}`, method: "DELETE" }),
      invalidatesTags: ["Brands"],
    }),

    getBanners: builder.query<ApiBanner[], void>({
      query: () => "/admin/banners",
      providesTags: ["Banners"],
    }),
    createBanner: builder.mutation<ApiBanner, Record<string, unknown>>({
      query: (body) => ({ url: "/admin/banners", method: "POST", body }),
      invalidatesTags: ["Banners"],
    }),
    updateBanner: builder.mutation<ApiBanner, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/banners/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Banners"],
    }),
    deleteBanner: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/banners/${id}`, method: "DELETE" }),
      invalidatesTags: ["Banners"],
    }),

    getPages: builder.query<ApiCmsPage[], void>({
      query: () => "/admin/pages",
      providesTags: ["Pages"],
    }),
    updatePage: builder.mutation<ApiCmsPage, { slug: string; body: Record<string, unknown> }>({
      query: ({ slug, body }) => ({ url: `/admin/pages/${slug}`, method: "PATCH", body }),
      invalidatesTags: ["Pages"],
    }),

    getOrders: builder.query<
      Paginated<ApiOrder>,
      { page?: number; status?: string } | void
    >({
      query: (params) =>
        `/admin/orders?page=${params?.page ?? 1}&limit=50${
          params?.status ? `&status=${params.status}` : ""
        }`,
      providesTags: ["Orders"],
    }),
    getOrder: builder.query<ApiOrder, string>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Orders", id }],
    }),
    updateOrderStatus: builder.mutation<ApiOrder, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders", "Dashboard"],
    }),
    addShipment: builder.mutation<
      ApiOrder,
      { id: string; carrier: string; trackingNumber: string }
    >({
      query: ({ id, carrier, trackingNumber }) => ({
        url: `/admin/orders/${id}/shipments`,
        method: "POST",
        body: { carrier, trackingNumber },
      }),
      invalidatesTags: ["Orders"],
    }),

    getQuotes: builder.query<ApiQuote[], void>({
      query: () => "/admin/quotes",
      providesTags: ["Quotes"],
    }),
    updateQuoteStatus: builder.mutation<ApiQuote, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/quotes/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Quotes", "Dashboard"],
    }),

    getCustomers: builder.query<ApiCustomer[], void>({
      query: () => "/admin/customers",
      providesTags: ["Customers"],
    }),
    updateCustomerTaxExempt: builder.mutation<ApiCustomer, { id: string; taxExempt: string }>({
      query: ({ id, taxExempt }) => ({
        url: `/admin/customers/${id}/tax-exempt`,
        method: "PATCH",
        body: { taxExempt },
      }),
      invalidatesTags: ["Customers"],
    }),

    getSettings: builder.query<ApiSettings, void>({
      query: () => "/admin/settings",
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<ApiSettings, Record<string, unknown>>({
      query: (body) => ({ url: "/admin/settings", method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),

    getCoupons: builder.query<ApiCoupon[], void>({
      query: () => "/admin/coupons",
      providesTags: ["Coupons"],
    }),
    createCoupon: builder.mutation<ApiCoupon, Record<string, unknown>>({
      query: (body) => ({ url: "/admin/coupons", method: "POST", body }),
      invalidatesTags: ["Coupons"],
    }),
    updateCoupon: builder.mutation<ApiCoupon, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/admin/coupons/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Coupons"],
    }),
    deleteCoupon: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Coupons"],
    }),

    createPage: builder.mutation<ApiCmsPage, Record<string, unknown>>({
      query: (body) => ({ url: "/admin/pages", method: "POST", body }),
      invalidatesTags: ["Pages"],
    }),
    deletePage: builder.mutation<void, string>({
      query: (slug) => ({ url: `/admin/pages/${slug}`, method: "DELETE" }),
      invalidatesTags: ["Pages"],
    }),

    getMessages: builder.query<ApiContactMessage[], void>({
      query: () => "/admin/messages",
      providesTags: ["Messages"],
    }),
    updateMessageRead: builder.mutation<ApiContactMessage, { id: string; read: boolean }>({
      query: ({ id, read }) => ({ url: `/admin/messages/${id}`, method: "PATCH", body: { read } }),
      invalidatesTags: ["Messages"],
    }),
    deleteMessage: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/messages/${id}`, method: "DELETE" }),
      invalidatesTags: ["Messages"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useGetDashboardQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useImportProductsMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useGetPagesQuery,
  useUpdatePageMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useAddShipmentMutation,
  useGetQuotesQuery,
  useUpdateQuoteStatusMutation,
  useGetCustomersQuery,
  useUpdateCustomerTaxExemptMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useCreatePageMutation,
  useDeletePageMutation,
  useGetMessagesQuery,
  useUpdateMessageReadMutation,
  useDeleteMessageMutation,
} = adminApi;
