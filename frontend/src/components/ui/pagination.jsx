import * as React from "react";
import { cn } from "@/lib/utils";

const Pagination = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Pagination.displayName = "Pagination";

export { Pagination };