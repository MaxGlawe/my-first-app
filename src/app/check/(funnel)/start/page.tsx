import { StartClient } from "@/components/schmerzcheck/check/StartClient"

export default async function CheckStartPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  return <StartClient token={t ?? ""} />
}
