import * as React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Slider.displayName = "Slider";

export { Slider };