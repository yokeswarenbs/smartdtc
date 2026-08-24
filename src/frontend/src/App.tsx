import { Toaster } from "@/components/ui/sonner";
import { BusesPage } from "@/pages/BusesPage";
import { CrewPage } from "@/pages/CrewPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LinkedDutyPage } from "@/pages/LinkedDutyPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { RoadConditionsPage } from "@/pages/RoadConditionsPage";
import { RoutesPage } from "@/pages/RoutesPage";
import { UnlinkedDutyPage } from "@/pages/UnlinkedDutyPage";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute();

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const busesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buses",
  component: BusesPage,
});

const crewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crew",
  component: CrewPage,
});

const linkedDutyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scheduling/linked",
  component: LinkedDutyPage,
});

const unlinkedDutyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scheduling/unlinked",
  component: UnlinkedDutyPage,
});

const routesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/routes",
  component: RoutesPage,
});

const roadConditionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/road-conditions",
  component: RoadConditionsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  busesRoute,
  crewRoute,
  linkedDutyRoute,
  unlinkedDutyRoute,
  routesRoute,
  roadConditionsRoute,
  reportsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
