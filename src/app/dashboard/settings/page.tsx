import { SettingsTabs } from "./_components/settings-tabs";
import { version } from "~/package.json";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-2 pt-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your profile, security settings, and account preferences.
        </p>
        <p className="text-muted-foreground/60 mt-1 text-xs">v{version}</p>
      </div>

      <SettingsTabs />
    </div>
  );
}
