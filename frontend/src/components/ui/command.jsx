import * as React from "react";
import { cn } from "@/lib/utils";

const Command = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Command.displayName = "Command";

export { Command };