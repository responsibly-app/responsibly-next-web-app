import { UsersTable } from "@/components/admin/users-table";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-2 pt-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage all users — roles, bans, sessions, and more.</p>
      </div>
      <UsersTable />
    </div>
  );
}
