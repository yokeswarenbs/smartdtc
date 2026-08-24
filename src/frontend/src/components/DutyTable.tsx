import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Duty } from "@/types";

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Scheduled: "secondary",
  "In Progress": "default",
  Completed: "outline",
  Cancelled: "destructive",
};

export function DutyTable({ duties }: { duties: Duty[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Crew Member</TableHead>
          <TableHead>Bus</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {duties.map((duty) => (
          <TableRow key={duty.id} data-ocid={`duty_row.${duty.id}`}>
            <TableCell className="font-medium">{duty.code}</TableCell>
            <TableCell>{duty.crewMember}</TableCell>
            <TableCell>{duty.bus}</TableCell>
            <TableCell>{duty.route}</TableCell>
            <TableCell>{duty.startTime}</TableCell>
            <TableCell>{duty.endTime}</TableCell>
            <TableCell className="text-right">
              <Badge variant={statusVariant[duty.status]}>{duty.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
