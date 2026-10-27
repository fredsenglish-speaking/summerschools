-- Months a school runs in (1 = January … 12 = December), for the "Month" search.
alter table schools add column if not exists months int[] not null default '{}';
