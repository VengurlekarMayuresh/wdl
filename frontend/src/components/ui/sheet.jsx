import * as React from "react";
import { cn } from "@/lib/utils";

const Sheet = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Sheet.displayName = "Sheet";

export { Sheet };