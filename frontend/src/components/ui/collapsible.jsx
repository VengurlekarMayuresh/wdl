import * as React from "react";
import { cn } from "@/lib/utils";

const Collapsible = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Collapsible.displayName = "Collapsible";

export { Collapsible };