import { getSupabaseServer } from "@/utils/supabase";

export type ServiceItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  is_extra: boolean;
};

export class Service {
  static async findByBarbershopId(barbershopId: string): Promise<ServiceItem[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("barbershop_id", barbershopId)
      .order("is_extra")
      .order("price");

    if (error) throw new Error(`Gagal mengambil layanan: ${error.message}`);
    return ((data ?? []) as (import("@/utils/supabase").ServiceRow & {
      service_name?: string;
      harga?: number;
    })[]).map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name || s.service_name || "",
      price: s.price || s.harga || 0,
      is_extra: s.is_extra,
    }));
  }
}
