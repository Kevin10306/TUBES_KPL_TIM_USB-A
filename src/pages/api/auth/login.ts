import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Gunakan POST untuk login.",
    });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "Email wajib diisi",
      });
    }

    let user = await User.findByEmail(email);

    // Tamu / email baru → buat demo user
    if (!user) {
      user = await User.createDemoUser({
        full_name: email.split("@")[0],
        email,
      });
    }

    return res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("[API auth/login POST]", error);
    return res.status(500).json({
      error: "Login Failed",
      message:
        error instanceof Error ? error.message : "Gagal melakukan login",
    });
  }
}
