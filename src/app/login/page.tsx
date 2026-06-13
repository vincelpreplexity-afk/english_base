import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-heading text-lg font-semibold text-stone-900">
            English Base
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <h1 className="text-sm font-medium text-stone-700">Введите пароль</h1>

          <form action={login} className="space-y-3">
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              required
              autoFocus
              className="h-9 w-full rounded-lg border border-stone-200 px-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
            <button
              type="submit"
              className="w-full h-9 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors active:scale-[0.98]"
            >
              Войти
            </button>
          </form>

          <ErrorMessage searchParams={searchParams} />
        </div>
      </div>
    </main>
  )
}

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  if (!params.error) return null
  return (
    <p className="text-xs text-red-600 text-center">
      Неверный пароль
    </p>
  )
}
