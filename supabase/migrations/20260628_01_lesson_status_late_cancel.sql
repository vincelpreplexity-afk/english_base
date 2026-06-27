-- ============================================================
-- lesson_status — add 'cancelled_late' (поздняя отмена < 24ч, оплачивается)
-- Part of the "lesson lifecycle" work: distinguishes a billable late
-- cancellation from a plain cancellation. Kept ALONE in its own migration —
-- Postgres forbids using a new enum value in the same transaction that adds it.
-- Idempotent: safe to run on the existing production DB.
-- ============================================================
alter type lesson_status add value if not exists 'cancelled_late';
