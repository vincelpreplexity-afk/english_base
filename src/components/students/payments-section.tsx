'use client'

import { useState, useTransition } from 'react'
import { Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  updateStudentRate,
  addPayment,
  deletePayment,
} from '@/app/(app)/students/actions'

export type PaymentRow = {
  id: string
  amount: number
  note: string | null
  paid_at: string
}

const fmt = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))

const INPUT_CLS =
  'h-9 w-full rounded-lg border border-stone-200 px-3 text-sm text-stone-900 ' +
  'outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15 ' +
  'placeholder:text-stone-400'

export function PaymentsSection({
  studentId,
  rate,
  balance,
  payments,
}: {
  studentId: string
  rate: number | null
  balance: number
  payments: PaymentRow[]
}) {
  const [rateVal, setRateVal] = useState(rate != null ? String(rate) : '')
  const [custom, setCustom] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const rateNum = rate ?? null

  function saveRate() {
    const parsed = rateVal.trim() === '' ? null : Number(rateVal)
    if (parsed != null && (!Number.isFinite(parsed) || parsed < 0)) {
      setError('Некорректная ставка')
      return
    }
    setError('')
    startTransition(() => updateStudentRate(studentId, parsed))
  }

  function payOne() {
    if (rateNum == null || rateNum <= 0) return
    setError('')
    startTransition(() => addPayment(studentId, rateNum))
  }

  function payCustom() {
    const parsed = Number(custom)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Введите сумму больше нуля')
      return
    }
    setError('')
    startTransition(async () => {
      await addPayment(studentId, parsed)
      setCustom('')
    })
  }

  function remove(id: string) {
    startTransition(() => deletePayment(id, studentId))
  }

  // Balance tone: positive = предоплата (green), negative = долг (red), 0 = ровно.
  const tone =
    balance > 0
      ? { cls: 'text-green-700', label: 'Предоплата' }
      : balance < 0
        ? { cls: 'text-red-600', label: 'Долг' }
        : { cls: 'text-stone-700', label: 'Баланс' }

  return (
    <div className="space-y-5">
      {/* Balance */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          {tone.label}
        </span>
        <span className={`font-heading text-2xl font-semibold ${tone.cls}`}>
          {balance < 0 ? fmt(Math.abs(balance)) : fmt(balance)}
        </span>
      </div>

      {/* Rate */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-stone-600 block">
          Стоимость занятия
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              value={rateVal}
              onChange={(e) => setRateVal(e.target.value)}
              placeholder="напр. 2000"
              className={`${INPUT_CLS} pr-7`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              ₽
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={saveRate}
            disabled={isPending}
          >
            Сохранить
          </Button>
        </div>
      </div>

      {/* Add payment */}
      <div className="space-y-2 border-t border-stone-100 pt-4">
        <Button
          type="button"
          className="w-full"
          onClick={payOne}
          disabled={isPending || rateNum == null || rateNum <= 0}
        >
          {rateNum != null && rateNum > 0
            ? `Оплата за занятие · ${fmt(rateNum)}`
            : 'Оплата за занятие'}
        </Button>
        {(rateNum == null || rateNum <= 0) && (
          <p className="text-xs text-stone-400">
            Укажите стоимость занятия, чтобы засчитывать оплату одной кнопкой
          </p>
        )}

        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Другая сумма (за несколько занятий)"
            className={INPUT_CLS}
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={payCustom}
            disabled={isPending}
            className="shrink-0"
          >
            Внести
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* History */}
      {payments.length > 0 && (
        <div className="border-t border-stone-100 pt-4">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
            История платежей
          </p>
          <ul className="divide-y divide-stone-100">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-800">{fmt(p.amount)}</p>
                  <p className="text-xs text-stone-500">
                    {fmtDate(p.paid_at)}
                    {p.note ? ` · ${p.note}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  disabled={isPending}
                  aria-label="Удалить платёж"
                  className="size-9 flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-50"
                >
                  <Trash size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
