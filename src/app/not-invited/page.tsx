import SignOutButton from "@/components/auth/SignOutButton";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-8">
      <div className="max-w-md text-center">
        <p className="font-hand text-2xl text-burgundy">ex libris</p>
        <h1 className="mt-4 font-display text-4xl italic text-navy">
          This book isn&apos;t yours
        </h1>
        <p className="mt-4 font-body text-muted-foreground">
          You&apos;re signed in, but this account isn&apos;t one of the two on
          the inside cover. Sign out and try the other one.
        </p>
        <div className="mt-8">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
