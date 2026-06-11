import type { NextApiRequest, NextApiResponse } from "next";
import { Service } from "@/models/Service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { barbershopId } = req.query;

      if (!barbershopId || typeof barbershopId !== "string") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Parameter barbershopId wajib diisi",
        });
      }

      const services = await Service.findByBarbershopId(barbershopId);
      return res.status(200).json({ data: services });
    } catch (error) {
      console.error("[API services GET]", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data layanan",
      });
    }
  }

  return res.status(405).json({
    error: "Method Not Allowed",
    message: `Metode ${req.method} tidak didukung. Gunakan GET.`,
  });
}
