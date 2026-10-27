import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { SchoolForm } from "../../SchoolForm";

export default async function NewSchool() {
  await requireAdmin();
  const t = (await getT()).admin.form;
  return (
    <div className="wrap section narrow stack">
      <h1>{t.newTitle}</h1>
      <SchoolForm />
    </div>
  );
}
