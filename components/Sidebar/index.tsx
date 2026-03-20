"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = {
  className?: string;
};

const DashboardIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7v-9h-7v9Zm0-11h7V4h-7v5Z"
    />
  </svg>
);

const DevicesIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="7" y="2.5" width="10" height="19" rx="2" strokeWidth="1.8" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M10 5h4M11 18h2"
    />
  </svg>
);

const FormsIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
    />
  </svg>
);

const SettingsIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M10.3 2.9a1 1 0 0 1 1.4-.2l.8.6a1 1 0 0 0 1.2 0l.8-.6a1 1 0 0 1 1.4.2l1.2 1.7a1 1 0 0 0 1 .4l1-.1a1 1 0 0 1 1.1.9l.3 2a1 1 0 0 0 .7.8l.9.3a1 1 0 0 1 .7 1.2l-.5 1.9a1 1 0 0 0 .3 1l.7.6a1 1 0 0 1 .1 1.4l-1.3 1.6a1 1 0 0 0-.2 1.1l.4.9a1 1 0 0 1-.5 1.3l-1.8.9a1 1 0 0 0-.5.9v1a1 1 0 0 1-1 .9l-2-.1a1 1 0 0 0-1 .6l-.5.8a1 1 0 0 1-1.4.3l-1.7-1.1a1 1 0 0 0-1.1 0l-1.7 1.1a1 1 0 0 1-1.4-.3l-.5-.8a1 1 0 0 0-1-.6l-2 .1a1 1 0 0 1-1-.9v-1a1 1 0 0 0-.5-.9l-1.8-.9a1 1 0 0 1-.5-1.3l.4-.9a1 1 0 0 0-.2-1.1L2.7 15a1 1 0 0 1 .1-1.4l.7-.6a1 1 0 0 0 .3-1L3.3 10a1 1 0 0 1 .7-1.2l.9-.3a1 1 0 0 0 .7-.8l.3-2A1 1 0 0 1 7 4.8l1 .1a1 1 0 0 0 1-.4l1.2-1.6Z"
    />
    <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
  </svg>
);

const NotificationsIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const FavoritesIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);

const AdminIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const CrashesIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const navigationItems = [
  { label: "Dashboard", href: "/dashboard", Icon: DashboardIcon },
  { label: "Devices", href: "/devices", Icon: DevicesIcon },
  { label: "Forms & Payments", href: "/forms", Icon: FormsIcon },
  { label: "Notifications", href: "/notifications", Icon: NotificationsIcon },
  { label: "Favorites", href: "/favorites", Icon: FavoritesIcon },
  // { label: "Admin Sessions", href: "/admin-sessions", Icon: AdminIcon },
  { label: "Crashes", href: "/crashes", Icon: CrashesIcon },
  { label: "Settings", href: "/settings", Icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="sidebar-shell">
        <div className="sidebar-inner">
          <div className="sidebar-brand">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
                M
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-emerald-50">
                  Monetio Admin
                </p>
                <p className="text-xs text-emerald-100/80">
                  Remote Mobile Monitoring
                </p>
              </div>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/35 bg-emerald-300/18 px-3 py-1 text-xs font-semibold text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              System online
            </div>
          </div>

          <nav className="sidebar-nav">
            {navigationItems.map(({ label, href, Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                >
                  <span className="sidebar-link-icon">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <aside className="sidebar-mobile-shell">
        <nav className="sidebar-mobile-nav">
          {navigationItems.map(({ label, href, Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-mobile-link ${isActive ? "sidebar-mobile-link-active" : ""}`}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
