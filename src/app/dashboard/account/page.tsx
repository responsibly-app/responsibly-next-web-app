import { AccountProfile } from "./_components/account-profile";

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your profile, security settings, and account preferences.
        </p>
      </div>

      <AccountProfile />
    </div>
  );
}
