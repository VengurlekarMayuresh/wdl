import * as React from "react";
import { cn } from "@/lib/utils";

const Toggle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Toggle.displayName = "Toggle";

export { Toggle };