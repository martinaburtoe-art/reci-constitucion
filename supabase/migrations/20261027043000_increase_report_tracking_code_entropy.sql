-- Increase entropy of tracking codes for new reports from 6 hex characters to 12.
-- Existing codes remain valid and unchanged.
alter table public.reports
  alter column codigo set default upper(encode(gen_random_bytes(6), 'hex'));
