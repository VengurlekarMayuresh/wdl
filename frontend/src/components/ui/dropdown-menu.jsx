import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
DropdownMenu.displayName = "DropdownMenu";

export { DropdownMenu };