import * as React from "react";
import { cn } from "@/lib/utils";

const HoverCard = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
HoverCard.displayName = "HoverCard";

export { HoverCard };