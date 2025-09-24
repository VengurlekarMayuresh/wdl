import * as React from "react";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export { RadioGroup };