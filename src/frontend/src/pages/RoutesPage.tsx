import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { demoRoutes } from "@/data/demoData";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Active: "default",
  Suspended: "outline",
  "Under Review": "secondary",
};

export function RoutesPage() {
  return (
    <Layout title="Routes" crumbs={[{ label: "Routes" }]}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Route Network
            <Badge variant="secondary">Demo Data</Badge>
          </CardTitle>
          <CardDescription>
            {demoRoutes.length} routes connecting key destinations across the
            city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Stops</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoRoutes.map((route) => (
                <TableRow key={route.id} data-ocid={`route_row.${route.id}`}>
                  <TableCell className="font-mono font-medium">
                    {route.code}
                  </TableCell>
                  <TableCell>{route.name}</TableCell>
                  <TableCell>{route.origin}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell className="text-right">
                    {route.distanceKm} km
                  </TableCell>
                  <TableCell className="text-right">
                    {route.durationMin} min
                  </TableCell>
                  <TableCell className="text-right">{route.stops}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={statusVariant[route.status]}>
                      {route.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Layout>
  );
}
