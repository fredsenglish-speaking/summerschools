-- Organisers send schools through /submit; they wait unpublished until the admin saves them.
alter table schools add column if not exists organizer_contact text not null default '';
alter table schools add column if not exists submitted boolean not null default false;
