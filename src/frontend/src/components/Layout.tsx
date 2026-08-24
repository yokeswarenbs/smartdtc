import { SidebarNav } from "@/components/Sidebar";
import { type Crumb, TopBar } from "@/components/TopBar";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface LayoutProps {
  title: string;
  crumbs?: Crumb[];
  children: ReactNode;
}

function LayoutContent({ title, crumbs, children }: LayoutProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarInset className={cn("md:ml-64", collapsed && "md:ml-12")}>
      <TopBar crumbs={crumbs} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>
        <div className="flex-1">{children}</div>
        <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </SidebarInset>
  );
}

export function Layout({ title, crumbs, children }: LayoutProps) {
  return (
    <SidebarProvider>
      <SidebarNav />
      <LayoutContent title={title} crumbs={crumbs}>
        {children}
      </LayoutContent>
    </SidebarProvider>
  );
}
