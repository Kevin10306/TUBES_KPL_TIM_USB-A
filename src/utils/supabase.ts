import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export type Database = {
  public: {
    Tables: {
      barbershops: { Row: BarbershopRow };
      barbershop_hours: { Row: BarbershopHourRow };
      barbers: { Row: BarberRow };
      services: { Row: ServiceRow };
      reviews: { Row: ReviewRow };
      bookings: { Row: BookingRow };
      coupons: { Row: CouponRow };
      demo_users: { Row: DemoUserRow };
      profiles: { Row: ProfileRow };
    };
  };
};

export type BarbershopRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  location: string;
  rating: number;
  review_count: number;
  status: string;
  about: string;
  created_at: string;
  updated_at: string;
};

export type BarbershopHourRow = {
  id: string;
  barbershop_id: string;
  days_label: string;
  time_range: string;
  sort_order: number;
};

export type BarberRow = {
  id: string;
  barbershop_id: string;
  name: string;
  role: string;
  avatar_url: string;
  is_active: boolean;
};

export type ServiceRow = {
  id: string;
  barbershop_id: string;
  slug: string;
  name: string;
  price: number;
  is_extra: boolean;
};

export type ReviewRow = {
  id: string;
  barbershop_id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
};

export type BookingRow = {
  id: string;
  user_id: string | null;
  profile_id: string | null;
  barbershop_id: string;
  barbershop_name: string;
  booking_date: string;
  booking_time: string;
  jadwal: string;
  service_name: string;
  extra_services: string;
  subtotal: number;
  discount: number;
  coupon_code: string | null;
  total: number;
  payment_status: string;
  payment_ref: string | null;
  created_at: string;
  updated_at: string;
};

export type CouponRow = {
  id: string;
  code: string;
  discount_amount: number;
  is_active: boolean;
  expires_at: string | null;
};

export type DemoUserRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

/** Browser / client-side singleton (anon key) */
export function getSupabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

/** Server-side singleton (service role — API routes only) */
export function getSupabaseServer(): SupabaseClient {
  if (!serverClient) {
    const key = supabaseServiceKey || supabaseAnonKey;
    if (!supabaseUrl || !key) {
      throw new Error(
        "Missing Supabase credentials. Set SUPABASE_SERVICE_ROLE_KEY for server operations."
      );
    }
    serverClient = createClient(supabaseUrl, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serverClient;
}
