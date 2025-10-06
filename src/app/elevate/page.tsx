import { redirect } from 'next/navigation'

// Redirect from /elevate to /quiz/elevate
// All elevate functionality now lives at /quiz/elevate

export default function ElevateRedirect() {
  redirect('/quiz/elevate')
}
