import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Gunakan POST untuk registrasi.",
    });
  }

  try {
    const { full_name, email, phone } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Nama lengkap dan email wajib diisi",
      });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: "Conflict",
        message: "Email sudah terdaftar. Silakan login.",
        user: existing,
      });
    }

    const user = await User.createDemoUser({ full_name, email, phone });

    return res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("[API auth/register POST]", error);
    return res.status(500).json({
      error: "Registration Failed",
      message:
        error instanceof Error ? error.message : "Gagal mendaftar akun baru",
    });
  }
}
