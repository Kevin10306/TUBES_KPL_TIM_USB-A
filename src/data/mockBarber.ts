export const BARBER_DETAIL = {
  id: "masterpiece",
  name: "Master piece Barbershop - Haircut styling",
  location: "Jogja Expo Centre (2 km)",
  rating: 5.0,
  reviewCount: 24,
  status: "Open",
  image: "https://images.unsplash.com/photo-1585747860715-2b5a879ef447?w=800&h=400&fit=crop",
  about:
    "Di Masterpiece Barbershop, tim tukang cukur terampil kami yang berdedikasi adalah seniman sejati dalam bidangnya, yang akan mengubah penampilan rambut Anda menjadi karya seni yang memukau.",
  hours: [
    { days: "Senin - Jumat", time: "09.00 - 20.00" },
    { days: "Sabtu - Minggu", time: "09.00 - 21.00" },
  ],
  team: [
    { name: "Tigral", role: "Specialist Haircut", avatar: "https://i.pravatar.cc/80?img=11" },
    { name: "Lucas", role: "Specialist Coloring", avatar: "https://i.pravatar.cc/80?img=12" },
    { name: "Lemarcus", role: "Specialist Treatment", avatar: "https://i.pravatar.cc/80?img=13" },
  ],
  services: [
    { id: "basic", name: "Basic haircut", price: 20000 },
    { id: "basic-vitamin", name: "Basic haircut & vitamint", price: 30000 },
    { id: "kids", name: "Kids haircut", price: 10000 },
    { id: "kids-special", name: "Special kids haircut", price: 10000 },
    { id: "coloring", name: "Hair coloring", price: 50000 },
    { id: "color-treatment", name: "Hair color treatment", price: 15000 },
    { id: "treatment", name: "Hair treatment", price: 30000 },
    { id: "full-treatment", name: "Special full treatment", price: 45000 },
    { id: "massage", name: "Special massage", price: 25000 },
    { id: "extra-massage", name: "Additional massage", price: 5000 },
  ],
  schedule: {
    date: "28 Aug 2023",
    slots: ["08.00", "08.30", "09.00", "09.30", "10.00", "10.30"],
    barbers: [
      { name: "Satya", service: "Basic haircut", avatar: "https://i.pravatar.cc/60?img=14" },
      { name: "Dhimas", service: "Hair coloring", avatar: "https://i.pravatar.cc/60?img=15" },
      { name: "Julian", service: "Basic haircut", avatar: "https://i.pravatar.cc/60?img=16" },
    ],
  },
  reviews: [
    {
      name: "Satya",
      rating: 4.0,
      text: "Pelayanan bagus, direkomendasikan untuk pencari tempat potong rambut.",
    },
    {
      name: "Nanda",
      rating: 5.0,
      text: "Lokasinya tidak terlalu jauh dan hasil cukurnya bagus.",
    },
    {
      name: "Dhimas",
      rating: 4.0,
      text: "Harganya cukup terjangkau dan pelayanannya bagus, saya sangat puas.",
    },
    {
      name: "Erik",
      rating: 5.0,
      text: "Gaya pangkas rambut di sini benar-benar mengikuti perkembangan zaman, saya suka pelayanannya.",
    },
  ],
};

export const BOOKING_TIMES = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:30", "13:00",
  "15:30", "16:00", "17:00", "17:30",
];

export const BOOKING_SERVICES = [
  { id: "basic", name: "Basic haircut", price: 20000 },
  { id: "kids", name: "Kids haircut", price: 10000 },
  { id: "coloring", name: "Hair coloring", price: 50000 },
];

export const EXTRA_SERVICES = [
  { id: "massage", name: "Massage", price: 0 },
  { id: "extra-massage", name: "Extra massage", price: 5000 },
];

export const COUPON = {
  code: "DISC20PERCEN",
  discount: 5000,
};

export function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
