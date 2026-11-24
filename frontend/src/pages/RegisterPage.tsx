import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, type RegisterData } from '../auth/AuthContext'
import { AuthCard, buttonClass, inputClass } from '../components/AuthCard'
import { getErrorMessage } from '../lib/api'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Create account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <input name="name" placeholder="Name" className={inputClass} value={form.name} onChange={update} required />
        <input name="email" type="email" placeholder="Email" className={inputClass} value={form.email} onChange={update} required />
        <input name="password" type="password" placeholder="Password" className={inputClass} value={form.password} onChange={update} required />
        <input
          name="password_confirmation"
          type="password"
          placeholder="Confirm password"
          className={inputClass}
          value={form.password_confirmation}
          onChange={update}
          required
        />
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already registered?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  )
}
