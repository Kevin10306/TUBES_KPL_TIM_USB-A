import type { NextApiRequest, NextApiResponse } from "next";
import { Booking } from "@/models/Booking";

/**
 * Payment gateway — POST only.
 * Simulates payment processing then persists paid booking to Supabase.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Payment gateway hanya menerima metode POST.",
    });
  }

  try {
    const body = req.body;
    const required = [
      "barbershop_id",
      "barbershop_name",
      "booking_date",
      "booking_time",
      "jadwal",
      "service_name",
      "total",
    ];

    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return res.status(400).json({
          error: "Bad Request",
          message: `Field pembayaran '${field}' wajib diisi`,
        });
      }
    }

    if (typeof body.total !== "number" || body.total < 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Total pembayaran harus berupa angka valid",
      });
    }

    // Simulated payment gateway delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const booking = await Booking.createAndPay({
      user_id: body.user_id,
      profile_id: body.profile_id,
      barbershop_id: body.barbershop_id,
      barbershop_name: body.barbershop_name,
      booking_date: body.booking_date,
      booking_time: body.booking_time,
      jadwal: body.jadwal,
      service_name: body.service_name,
      extra_services: body.extra_services ?? "",
      subtotal: body.subtotal ?? body.total,
      discount: body.discount ?? 0,
      coupon_code: body.coupon_code,
      total: body.total,
    });

    return res.status(200).json({
      success: true,
      message: "Pembayaran berhasil diproses",
      payment_ref: booking.id,
      data: booking,
    });
  } catch (error) {
    console.error("[API payments POST]", error);
    return res.status(500).json({
      error: "Payment Failed",
      message:
        error instanceof Error
          ? error.message
          : "Pembayaran gagal diproses. Silakan coba lagi.",
    });
  }
}
