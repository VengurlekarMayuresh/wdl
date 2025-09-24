import * as React from "react";
import { cn } from "@/lib/utils";

const Chart = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Chart.displayName = "Chart";

export { Chart };