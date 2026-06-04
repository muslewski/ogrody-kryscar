import {
  LayoutDashboard,
  MapPin,
  Leaf,
  ClipboardList,
  History,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Role = "customer" | "gardener";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Sidebar nav per role. Hrefs map to real routes (Pulpit = the dashboard) or
 *  to clickable ComingSoon stub pages — the IA is real even before the
 *  features exist. */
export const NAV: Record<Role, NavItem[]> = {
  customer: [
    { label: "Pulpit", href: "/panel", icon: LayoutDashboard },
    { label: "Moje ogrody", href: "/panel/ogrody", icon: MapPin },
    { label: "Usługi", href: "/panel/uslugi", icon: Leaf },
    { label: "Zamówienia", href: "/panel/zamowienia", icon: ClipboardList },
    { label: "Historia", href: "/panel/historia", icon: History },
    { label: "Ustawienia", href: "/panel/ustawienia", icon: Settings },
  ],
  gardener: [
    { label: "Pulpit", href: "/zespol", icon: LayoutDashboard },
    { label: "Zlecenia", href: "/zespol/zlecenia", icon: ClipboardList },
    { label: "Klienci", href: "/zespol/klienci", icon: Users },
    { label: "Ustawienia", href: "/zespol/ustawienia", icon: Settings },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  customer: "Panel klienta",
  gardener: "Panel zespołu",
};
