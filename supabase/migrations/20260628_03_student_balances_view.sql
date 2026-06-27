-- ============================================================
-- student_balances — per-student balance view.
--   balance = total paid − total owed
--   owed     = sum of completed lessons' snapshot price
-- Positive = предоплата, negative = долг, 0 = ровно.
--
-- security_invoker = on so the view respects RLS of the underlying tables:
-- anon hits deny-all (no rows), only the service role reads data. Without it
-- the view would run as its owner and leak data through the publishable key.
-- Idempotent: create or replace.
-- ============================================================
create or replace view student_balances
with (security_invoker = on) as
select
  s.id   as student_id,
  s.name as name,
  coalesce(p.paid, 0) as paid,
  coalesce(l.owed, 0) as owed,
  coalesce(p.paid, 0) - coalesce(l.owed, 0) as balance
from students s
left join (
  select student_id, sum(amount) as paid
  from payments
  group by student_id
) p on p.student_id = s.id
left join (
  select student_id, sum(coalesce(price, 0)) as owed
  from lessons
  where status = 'completed'
  group by student_id
) l on l.student_id = s.id
where s.is_archived = false;
