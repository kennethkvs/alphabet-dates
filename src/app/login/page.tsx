import LoginSpread from "@/components/auth/LoginSpread";
import { safeNextPath } from "@/lib/access";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const nextPath = safeNextPath((await searchParams).next);

  return <LoginSpread nextPath={nextPath} />;
}
