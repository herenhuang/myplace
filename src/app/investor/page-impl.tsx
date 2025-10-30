"use client"

import { Suspense } from 'react'
import InvestorPage from './page'

export default function InvestorPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvestorPage />
    </Suspense>
  )
}
