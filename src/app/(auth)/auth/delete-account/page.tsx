import { DeleteAccountConfirm } from "../../_components/delete-account-confirm";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function DeleteAccountPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">Invalid or missing token.</p>
      </div>
    );
  }

  return <DeleteAccountConfirm token={token} />;
}
