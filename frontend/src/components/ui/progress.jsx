import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Progress.displayName = "Progress";

export { Progress };