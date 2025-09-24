import * as React from "react";
import { cn } from "@/lib/utils";

const Sidebar = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Sidebar.displayName = "Sidebar";

export { Sidebar };