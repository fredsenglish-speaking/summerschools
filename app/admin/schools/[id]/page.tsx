import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import type { School } from "@/lib/schools";
import { SchoolForm } from "../../SchoolForm";
import { deleteSchool } from "../../actions";
import { ConfirmButton } from "./ConfirmButton";

export default async function EditSchool({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const t = (await getT()).admin.form;
  return (
    <div className="wrap section narrow stack">
      <h1>{t.editTitle}</h1>
      <SchoolForm school={data as School} />
      <form action={deleteSchool}>
        <input type="hidden" name="id" value={id} />
        <ConfirmButton message={t.confirmDelete}>{t.delete}</ConfirmButton>
      </form>
    </div>
  );
}
