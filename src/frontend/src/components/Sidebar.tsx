import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { DEMO_DATA_LABEL } from "@/data/demoData";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Bus,
  CalendarClock,
  ChevronRight,
  Gauge,
  LayoutDashboard,
  Map as MapIcon,
  Route as RouteIcon,
  ShieldAlert,
  Users,
} from "lucide-react";

const mainNav = [
  { title: "Dashboard", to: "/", icon: LayoutDashboard },
  { title: "Buses", to: "/buses", icon: Bus },
  { title: "Crew", to: "/crew", icon: Users },
  { title: "Routes", to: "/routes", icon: RouteIcon },
  { title: "Road Conditions", to: "/road-conditions", icon: ShieldAlert },
  { title: "Reports", to: "/reports", icon: Gauge },
];

function Brand() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Bus className="size-4" />
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-display text-sm font-semibold">
            SMARTDTC
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            Transit Control
          </span>
        </div>
      )}
    </div>
  );
}

export function SidebarNav() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Brand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      to={item.to}
                      data-ocid={`nav.${item.to === "/" ? "dashboard" : item.to.slice(1)}`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <Collapsible asChild defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Scheduling">
                      <CalendarClock />
                      <span>Scheduling</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to="/scheduling/linked"
                            data-ocid="nav.scheduling.linked"
                          >
                            <span>Linked Duty</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to="/scheduling/unlinked"
                            data-ocid="nav.scheduling.unlinked"
                          >
                            <span>Unlinked Duty</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div
          className={cn(
            "flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-2 py-2 text-xs text-muted-foreground",
          )}
        >
          <MapIcon className="size-3.5 shrink-0" />
          <span className="truncate">{DEMO_DATA_LABEL}</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
