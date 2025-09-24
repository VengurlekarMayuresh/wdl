import * as React from "react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Separator.displayName = "Separator";

export { Separator };