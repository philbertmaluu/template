import type { ReactNode } from 'react'

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <img src="/logo.png" alt="NSSF" className="mx-auto mb-6 block w-24" />
        <h1 className="mb-6 text-center text-2xl font-semibold">{title}</h1>
        {children}
      </div>
    </div>
  )
}

export const inputClass =
  'w-full rounded-md bg-white px-3 py-2 text-sm shadow-md outline-none transition-shadow focus:shadow-lg focus:ring-2 focus:ring-indigo-100'

export const buttonClass =
  'w-full rounded-md bg-maroon px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50'
