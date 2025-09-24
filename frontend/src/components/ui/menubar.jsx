import * as React from "react";
import { cn } from "@/lib/utils";

const Menubar = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Menubar.displayName = "Menubar";

export { Menubar };