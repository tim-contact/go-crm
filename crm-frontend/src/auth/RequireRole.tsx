import type { JSX } from "react";

export function RequireRole({ roles, children }: {roles: string[], children: JSX.Element}) {
    const role = localStorage.getItem("role") || "";
    if (role == "admin" || roles.includes(role)) return children;
    return <div className="p-4 text-red-600">Forbidden</div>;

}
