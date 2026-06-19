import { getSupabaseServer } from "@/utils/supabase";

export class Coupon {
  static async validate(code: string): Promise<{ discount: number } | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !data) return null;

    const coupon = data as import("@/utils/supabase").CouponRow;
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return null;
    }

    return { discount: coupon.discount_amount };
  }
}
