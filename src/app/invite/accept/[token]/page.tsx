import AcceptInvite from "@/components/invite/AcceptInvite";

export default function Page({ params }: { params: { token: string } }) {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Accept your invite</h1>
      <AcceptInvite token={params.token} />
    </main>
  );
}
