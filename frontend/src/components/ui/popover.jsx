import * as React from "react";
import { cn } from "@/lib/utils";

const Popover = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Popover.displayName = "Popover";

export { Popover };