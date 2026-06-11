import { getSupabaseServer } from "@/utils/supabase";

export type DemoUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

export class User {
  static async findByEmail(email: string): Promise<DemoUser | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("demo_users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Gagal mencari user: ${error.message}`);
    }

    const row = data as DemoUser;
    return row;
  }

  static async findById(id: string): Promise<DemoUser | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("demo_users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Gagal mencari user: ${error.message}`);
    }

    return data as DemoUser;
  }

  static async createDemoUser(input: {
    full_name: string;
    email: string;
    phone?: string;
  }): Promise<DemoUser> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("demo_users")
      .insert({
        full_name: input.full_name,
        email: input.email.toLowerCase().trim(),
        phone: input.phone ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Gagal mendaftar user: ${error.message}`);
    return data as DemoUser;
  }
}
