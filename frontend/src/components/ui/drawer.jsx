import * as React from "react";
import { cn } from "@/lib/utils";

const Drawer = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Drawer.displayName = "Drawer";

export { Drawer };