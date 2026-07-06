import LoginForm from "@/components/auth/LoginForm";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-600">
            Sign in to access your Alphabet Dates and memories.
          </p>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
