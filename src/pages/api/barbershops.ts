import type { NextApiRequest, NextApiResponse } from "next";
import { Barbershop } from "@/models/Barbershop";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { id, slug } = req.query;

      if (typeof id === "string") {
        const detail = await Barbershop.findById(id);
        if (!detail) {
          return res.status(404).json({
            error: "Barbershop tidak ditemukan",
            message: `Tidak ada barbershop dengan id: ${id}`,
          });
        }
        return res.status(200).json({ data: detail });
      }

      if (typeof slug === "string") {
        const detail = await Barbershop.findBySlug(slug);
        if (!detail) {
          return res.status(404).json({
            error: "Barbershop tidak ditemukan",
            message: `Tidak ada barbershop dengan slug: ${slug}`,
          });
        }
        return res.status(200).json({ data: detail });
      }

      const barbershops = await Barbershop.all();
      return res.status(200).json({ data: barbershops, barbershops });
    } catch (error) {
      console.error("[API barbershops GET]", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data barbershop dari database",
      });
    }
  }

  return res.status(405).json({
    error: "Method Not Allowed",
    message: `Metode ${req.method} tidak didukung. Gunakan GET.`,
  });
}
