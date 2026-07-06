import NewDateForm from "@/components/dates/NewDateForm";

export default function Page() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">New date</h1>
        <NewDateForm />
      </div>
    </main>
  );
}
