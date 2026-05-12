import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/barbershops`
    );
    const data = await response.json();
    res.status(200).json({
      barbershops: data,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "gagal mengambil data",
    });
  }
}