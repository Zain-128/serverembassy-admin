import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Tags,
  Image,
  ShoppingBag,
  Users,
  Inbox,
  TicketPercent,
  Truck,
  FileText,
  Settings,
  MailPlus,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/store/useAuth";
import Logo from "@/components/Logo";

const ALL = ["super_admin", "admin"];
const CATALOG = [...ALL, "catalog"];
const SALES = [...ALL, "sales"];
const FINANCE = [...ALL, "finance"];
const CONTENT = [...ALL, "content"];

const sections = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, roles: ALL }],
  },
  {
    label: "Catalog",
    items: [
      { to: "/products", label: "Products", icon: Package, roles: CATALOG },
      { to: "/categories", label: "Categories", icon: Layers, roles: CATALOG },
      { to: "/brands", label: "Brands", icon: Tags, roles: CATALOG },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/orders", label: "Orders", icon: ShoppingBag, roles: FINANCE },
      { to: "/customers", label: "Customers", icon: Users, roles: SALES },
      { to: "/quotes", label: "Quotes / RFQ", icon: Inbox, roles: SALES },
      { to: "/coupons", label: "Coupons", icon: TicketPercent, roles: CATALOG },
      { to: "/shipping", label: "Shipping", icon: Truck, roles: ALL },
    ],
  },
  {
    label: "Storefront",
    items: [
      { to: "/banners", label: "Banners", icon: Image, roles: CONTENT },
      { to: "/pages", label: "CMS Pages", icon: FileText, roles: CONTENT },
      { to: "/messages", label: "Messages", icon: MailPlus, roles: SALES },
      { to: "/settings", label: "Settings", icon: Settings, roles: ALL },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => (user?.role ? item.roles.includes(user.role) : true)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-page">
      <aside className="flex flex-col bg-navy text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <Logo light />
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {visibleSections.map((section) => (
            <div key={section.label}>
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {section.label}
              </p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={"end" in item && item.end ? true : false}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        isActive ? "bg-brand text-white" : "text-white/75 hover:bg-white/10"
                      }`
                    }
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-xs text-white/60">{user?.email}</p>
          <button
            type="button"
            className="mt-2 flex items-center gap-2 text-sm text-white/80"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-white px-8 py-4">
          <p className="text-sm text-muted">Connected to API · {user?.fullName || user?.email}</p>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-brand"
          >
            View storefront →
          </a>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
