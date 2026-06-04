"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./AppSidebar";
import { ROLE_LABEL, type Role } from "./app-nav";

/**
 * Authenticated app shell shared by /panel (customer) and /zespol (gardener).
 * Server gate layouts pass the verified role + user identity; the shell renders
 * the role-driven sidebar, a topbar (trigger + role label), and the page inside
 * the single <main> landmark (a11y-first — the AI-navigable contract).
 */
export function AppShell({
  role,
  user,
  children,
}: {
  role: Role;
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} user={user} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <span className="text-sm font-medium text-neutral-600">
            {ROLE_LABEL[role]}
          </span>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
