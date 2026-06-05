import { Request, Response, NextFunction } from "express";
import { Role } from "@d-chemistry/shared";

export function roleGuard(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions. Required roles: " + allowedRoles.join(", "),
      });
      return;
    }

    next();
  };
}
