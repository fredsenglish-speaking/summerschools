import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { SUPABASE_URL } from "./supabase/url";

/** The signed-in user's id if they are listed in the admins table, else null. */
export async function getAdminId(): Promise<string | null> {
  if (!SUPABASE_URL) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user.id : null;
}

export async function requireAdmin(): Promise<string> {
  const id = await getAdminId();
  if (!id) redirect("/login");
  return id;
}
