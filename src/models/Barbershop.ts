import {
  getSupabaseServer,
  BarbershopRow,
  ServiceRow,
  BarbershopHourRow,
  BarberRow,
  ReviewRow,
} from "@/utils/supabase";

export type BarbershopListItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  location: string;
  rating: number;
  review_count: number;
  status: string;
};

export type BarbershopDetail = BarbershopListItem & {
  about: string;
  hours: { days: string; time: string }[];
  team: { name: string; role: string; avatar: string }[];
  services: { id: string; slug: string; name: string; price: number }[];
  extra_services: { id: string; slug: string; name: string; price: number }[];
  reviews: { name: string; rating: number; text: string }[];
};

function mapList(row: BarbershopRow): BarbershopListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image,
    location: row.location,
    rating: Number(row.rating),
    review_count: row.review_count,
    status: row.status,
  };
}

export class Barbershop {
  static async all(): Promise<BarbershopListItem[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("barbershops")
      .select("*")
      .order("rating", { ascending: false });

    if (error) throw new Error(`Gagal mengambil data barbershop: ${error.message}`);
    return ((data ?? []) as BarbershopRow[]).map(mapList);
  }

  static async findById(id: string): Promise<BarbershopDetail | null> {
    const supabase = getSupabaseServer();

    const { data: shop, error } = await supabase
      .from("barbershops")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Barbershop tidak ditemukan: ${error.message}`);
    }

    const shopRow = shop as BarbershopRow;

    const [hoursRes, barbersRes, servicesRes, reviewsRes] = await Promise.all([
      supabase
        .from("barbershop_hours")
        .select("*")
        .eq("barbershop_id", id)
        .order("sort_order"),
      supabase.from("barbers").select("*").eq("barbershop_id", id),
      supabase
        .from("services")
        .select("*")
        .eq("barbershop_id", id)
        .order("is_extra")
        .order("price"),
      supabase
        .from("reviews")
        .select("*")
        .eq("barbershop_id", id)
        .order("created_at", { ascending: false }),
    ]);

    const allServices: ServiceRow[] = servicesRes.data ?? [];
    const mapSvc = (s: ServiceRow & { service_name?: string; harga?: number }) => ({
      id: s.id,
      slug: s.slug,
      name: s.name || s.service_name || "",
      price: s.price || s.harga || 0,
    });

    return {
      ...mapList(shopRow),
      about: shopRow.about,
      hours: ((hoursRes.data ?? []) as BarbershopHourRow[]).map((h) => ({
        days: h.days_label,
        time: h.time_range,
      })),
      team: ((barbersRes.data ?? []) as BarberRow[]).map((b) => ({
        name: b.name,
        role: b.role,
        avatar: b.avatar_url,
      })),
      services: allServices.filter((s) => !s.is_extra).map(mapSvc),
      extra_services: allServices.filter((s) => s.is_extra).map(mapSvc),
      reviews: ((reviewsRes.data ?? []) as ReviewRow[]).map((r) => ({
        name: r.reviewer_name,
        rating: Number(r.rating),
        text: r.review_text,
      })),
    };
  }

  static async findBySlug(slug: string): Promise<BarbershopDetail | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;
    return Barbershop.findById((data as { id: string }).id);
  }
}
