import { getSupabaseServer, BookingRow } from "@/utils/supabase";

export type BookingInput = {
  user_id?: string;
  profile_id?: string;
  barbershop_id: string;
  barbershop_name: string;
  booking_date: string;
  booking_time: string;
  jadwal: string;
  service_name: string;
  extra_services?: string;
  subtotal: number;
  discount?: number;
  coupon_code?: string;
  total: number;
};

export type BookingItem = {
  id: string;
  barbershopName: string;
  jadwal: string;
  service: string;
  total: number;
  payment_status: string;
  createdAt: string;
};

function mapBooking(row: BookingRow): BookingItem {
  return {
    id: row.id,
    barbershopName: row.barbershop_name,
    jadwal: row.jadwal,
    service: row.extra_services
      ? `${row.service_name}, ${row.extra_services}`
      : row.service_name,
    total: row.total,
    payment_status: row.payment_status,
    createdAt: row.created_at,
  };
}

export class Booking {
  static async findByUserId(userId: string): Promise<BookingItem[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Gagal mengambil jadwal: ${error.message}`);
    return ((data ?? []) as BookingRow[]).map(mapBooking);
  }

  static async create(input: BookingInput): Promise<BookingItem> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: input.user_id ?? null,
        profile_id: input.profile_id ?? null,
        barbershop_id: input.barbershop_id,
        barbershop_name: input.barbershop_name,
        booking_date: input.booking_date,
        booking_time: input.booking_time,
        jadwal: input.jadwal,
        service_name: input.service_name,
        extra_services: input.extra_services ?? "",
        subtotal: input.subtotal,
        discount: input.discount ?? 0,
        coupon_code: input.coupon_code ?? null,
        total: input.total,
        payment_status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(`Gagal membuat booking: ${error.message}`);
    return mapBooking(data as BookingRow);
  }

  static async markPaid(
    bookingId: string,
    paymentRef: string
  ): Promise<BookingItem> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        payment_ref: paymentRef,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw new Error(`Gagal memperbarui pembayaran: ${error.message}`);
    return mapBooking(data as BookingRow);
  }

  static async createAndPay(input: BookingInput): Promise<BookingItem> {
    const booking = await Booking.create(input);
    const ref = `PAY-${Date.now()}-${booking.id.slice(0, 8)}`;
    return Booking.markPaid(booking.id, ref);
  }
}
