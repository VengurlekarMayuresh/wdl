import * as React from "react";
import { cn } from "@/lib/utils";

const Carousel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
Carousel.displayName = "Carousel";

export { Carousel };