import { getDemoBusiness } from '@/lib/demo-businesses'
import { DemoPreviewPage } from '@/components/demo-preview-page'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const business = getDemoBusiness(params.slug)
  if (!business) return { title: 'Demo Not Found' }

  return {
    title: `${business.name} × My Assistant — Live AI Demo`,
    description: `See how ${business.name} could answer customer questions 24/7 with a custom AI assistant.`,
  }
}

export default function DemoPage({ params }) {
  const business = getDemoBusiness(params.slug)
  if (!business) notFound()

  return <DemoPreviewPage business={business} />
}
