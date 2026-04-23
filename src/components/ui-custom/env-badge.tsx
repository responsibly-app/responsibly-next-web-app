import { ENVIRONMENT } from "@/config";

export function EnvBadge() {
  if (ENVIRONMENT === "prod") return null;
  return (
    <span className="rounded-full bg-amber-100 px-2 mx-5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
      {ENVIRONMENT}
    </span>
  );
}
