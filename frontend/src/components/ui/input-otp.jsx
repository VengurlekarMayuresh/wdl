import * as React from "react";
import { cn } from "@/lib/utils";

const InputOtp = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
InputOtp.displayName = "InputOtp";

export { InputOtp };