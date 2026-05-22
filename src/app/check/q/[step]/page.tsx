import { QuestionClient } from "@/components/schmerzcheck/check/QuestionClient"

export default async function CheckQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ step: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { step } = await params
  const { t } = await searchParams
  return <QuestionClient step={Number(step)} token={t ?? ""} />
}
