import LoginForm from "@/components/auth/LoginForm";

export default function Page({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextPath = searchParams?.next || '/dates';

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Log in</h1>
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
