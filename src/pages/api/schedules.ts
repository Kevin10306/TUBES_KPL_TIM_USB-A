import type { NextApiRequest, NextApiResponse } from "next";
import { Booking } from "@/models/Booking";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== "string") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Parameter userId wajib diisi untuk mengambil jadwal cukur",
        });
      }

      const schedule = await Booking.findByUserId(userId);
      return res.status(200).json({ schedule, data: schedule });
    } catch (error) {
      console.error("[API schedules GET]", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil jadwal cukur dari database",
      });
    }
  }

  if (req.method === "POST") {
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
        if (!body[field] && body[field] !== 0) {
          return res.status(400).json({
            error: "Bad Request",
            message: `Field '${field}' wajib diisi`,
          });
        }
      }

      const booking = await Booking.create({
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

      return res.status(201).json({
        message: "Booking berhasil dibuat",
        data: booking,
      });
    } catch (error) {
      console.error("[API schedules POST]", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan jadwal cukur",
      });
    }
  }

  return res.status(405).json({
    error: "Method Not Allowed",
    message: `Metode ${req.method} tidak didukung. Gunakan GET atau POST.`,
  });
}
