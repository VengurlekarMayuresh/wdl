import * as React from "react";
import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
NavigationMenu.displayName = "NavigationMenu";

export { NavigationMenu };