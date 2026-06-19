import type { NextApiRequest, NextApiResponse } from "next";
import { Coupon } from "@/models/Coupon";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { code } = req.body;

      if (!code || typeof code !== "string") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Kode kupon wajib diisi",
        });
      }

      const result = await Coupon.validate(code);

      if (!result) {
        return res.status(404).json({
          error: "Invalid Coupon",
          message: "Kupon tidak valid atau sudah kedaluwarsa",
        });
      }

      return res.status(200).json({
        message: "Kupon valid",
        discount: result.discount,
      });
    } catch (error) {
      console.error("[API coupons POST]", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Gagal memvalidasi kupon",
      });
    }
  }

  return res.status(405).json({
    error: "Method Not Allowed",
    message: "Gunakan POST untuk validasi kupon.",
  });
}
