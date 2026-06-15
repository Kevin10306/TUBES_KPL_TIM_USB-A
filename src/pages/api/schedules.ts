import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/jadwal`
        );
        const data = await response.json();
        res.status(200).json({
            schedule: data,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "gagal mengambil data",
        });
    }
}