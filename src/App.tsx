import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ReduxProvider } from "@/store/useAuth";
import { ToastProvider } from "@/components/Toast";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductFormPage from "@/pages/ProductFormPage";
import ImportPage from "@/pages/ImportPage";
import CategoriesPage from "@/pages/CategoriesPage";
import BrandsPage from "@/pages/BrandsPage";
import BannersPage from "@/pages/BannersPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import CustomersPage from "@/pages/CustomersPage";
import QuotesPage from "@/pages/QuotesPage";
import CouponsPage from "@/pages/CouponsPage";
import ShippingPage from "@/pages/ShippingPage";
import PagesPage from "@/pages/PagesPage";
import SettingsPage from "@/pages/SettingsPage";
import MessagesPage from "@/pages/MessagesPage";

export default function App() {
  return (
    <ReduxProvider>
      <ToastProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/new" element={<ProductFormPage />} />
              <Route path="/products/import" element={<ImportPage />} />
              <Route path="/products/:id" element={<ProductFormPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/banners" element={<BannersPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/quotes" element={<QuotesPage />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/pages" element={<PagesPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
</BrowserRouter>
      </ToastProvider>
    </ReduxProvider>
  );
}
