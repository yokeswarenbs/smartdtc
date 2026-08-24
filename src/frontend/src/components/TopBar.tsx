import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { demoAlerts } from "@/data/demoData";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Bell, ChevronRight, LogOut, Settings, User } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

interface TopBarProps {
  crumbs?: Crumb[];
}

const unreadCount = demoAlerts.filter((a) => !a.read).length;

function severityDot(severity: string) {
  return cn(
    "size-2 shrink-0 rounded-full",
    severity === "Critical" && "bg-destructive",
    severity === "Warning" && "bg-chart-5",
    severity === "Info" && "bg-chart-2",
  );
}

export function TopBar({ crumbs = [] }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4">
      <SidebarTrigger data-ocid="sidebar_toggle" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">SMARTDTC</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb, i) => (
            <BreadcrumbItem key={crumb.label}>
              <BreadcrumbSeparator />
              {crumb.to ? (
                <BreadcrumbLink asChild>
                  <Link to={crumb.to}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
              {i === crumbs.length - 1 ? null : null}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <Badge
          variant="outline"
          className="hidden gap-1.5 border-primary/30 bg-primary/5 text-primary sm:inline-flex"
          data-ocid="demo_mode_badge"
        >
          <span className="size-1.5 rounded-full bg-primary" />
          Demo Mode
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
              data-ocid="notifications_button"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80"
            data-ocid="notifications_menu"
          >
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary">{unreadCount} unread</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              {demoAlerts.map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  className="flex items-start gap-3 py-2.5"
                  data-ocid={`notification.${alert.id}`}
                >
                  <span className={cn("mt-1.5", severityDot(alert.severity))} />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium">{alert.title}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {alert.message}
                    </span>
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 px-1.5"
              aria-label="Profile menu"
              data-ocid="profile_button"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  OP
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline">
                Ops Manager
              </span>
              <ChevronRight className="hidden size-3.5 rotate-90 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
            data-ocid="profile_menu"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Ops Manager</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ops@smartdtc.example
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-ocid="profile_menu.profile">
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem data-ocid="profile_menu.settings">
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-ocid="profile_menu.logout">
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
