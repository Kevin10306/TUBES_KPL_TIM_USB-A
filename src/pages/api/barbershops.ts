import type { NextApiRequest, NextApiResponse } from "next";
import { Barbershop } from "../../models/Barbershop";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const barbershops = await Barbershop.all();
    res.status(200).json({ data: barbershops });
  } catch (error) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
}