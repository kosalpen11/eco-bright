import { CURRENCY } from "@/lib/constants";
import type { Product } from "@/types/product";

type ProductSeed = Omit<
  Product,
  "currency" | "inStock" | "isActive" | "sortOrder" | "createdOrder"
> & {
  sortOrder?: number;
};

const productSeeds: ProductSeed[] = [
  {
    id: "prd_001",
    title: "EcoBright LED Bulb 12W",
    category: "led-bulbs",
    categoryLabel: "LED Bulb",
    useCase: "Home Lighting",
    description:
      "Bright, efficient bulb for daily home and office use with warm tone comfort and reliable output.",
    imageUrl:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80&auto=format&fit=crop",
    price: 3.5,
    oldPrice: 4.2,
    tags: ["12W", "Warm White", "Energy Saving"],
    badge: "new",
    rating: 4.8,
    sortOrder: 4,
  },
  {
    id: "prd_002",
    title: "EcoBright LED Bulb 20W",
    category: "led-bulbs",
    categoryLabel: "LED Bulb",
    useCase: "Shop & Office",
    description:
      "Higher output bulb with clean white brightness for storefronts, counters, kitchens, and active work areas.",
    imageUrl:
      "https://images.unsplash.com/photo-1534081333815-ae5019106622?w=1200&q=80&auto=format&fit=crop",
    price: 5.2,
    oldPrice: 6.1,
    tags: ["20W", "Cool White", "High Output"],
    badge: "sale",
    rating: 4.7,
    sortOrder: 7,
  },
  {
    id: "prd_003",
    title: "LED Tube T8 20W",
    category: "led-tubes",
    categoryLabel: "LED Tube",
    useCase: "Shop & Office",
    description:
      "Durable LED tube for shops, warehouses, and offices with even brightness and low maintenance cost.",
    imageUrl:
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200&q=80&auto=format&fit=crop",
    price: 4.9,
    oldPrice: null,
    tags: ["20W", "Commercial", "Bright"],
    badge: "hot",
    rating: 4.8,
    sortOrder: 5,
  },
  {
    id: "prd_004",
    title: "Slim LED Tube T5 10W",
    category: "led-tubes",
    categoryLabel: "LED Tube",
    useCase: "Cabinet Lighting",
    description:
      "Compact tube for cabinets, display shelves, and narrow spaces where crisp low-profile lighting matters.",
    imageUrl:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&q=80&auto=format&fit=crop",
    price: 3.2,
    oldPrice: 3.8,
    tags: ["10W", "Slim", "Display"],
    badge: "new",
    rating: 4.6,
    sortOrder: 10,
  },
  {
    id: "prd_005",
    title: "Solar Flood Light 200W",
    category: "solar-flood-lights",
    categoryLabel: "Solar Flood Light",
    useCase: "Outdoor Security",
    description:
      "High-power solar flood light with remote control, weather resistance, and dependable night coverage.",
    imageUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&q=80&auto=format&fit=crop",
    price: 58,
    oldPrice: 67,
    tags: ["200W", "Solar", "Remote"],
    badge: "hot",
    rating: 4.9,
    sortOrder: 1,
  },
  {
    id: "prd_006",
    title: "Solar Flood Light 100W Motion",
    category: "solar-flood-lights",
    categoryLabel: "Solar Flood Light",
    useCase: "Outdoor Security",
    description:
      "Motion-assisted flood light for gates, compounds, and driveways where flexible brightness saves battery.",
    imageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80&auto=format&fit=crop",
    price: 39,
    oldPrice: 45,
    tags: ["100W", "Motion Sensor", "Remote"],
    badge: "sale",
    rating: 4.7,
    sortOrder: 8,
  },
  {
    id: "prd_007",
    title: "Solar Street Light 300W",
    category: "solar-street-lights",
    categoryLabel: "Solar Street Light",
    useCase: "Road & Yard",
    description:
      "Integrated street light for roads, villas, compounds, and warehouse exteriors with broad spread.",
    imageUrl:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80&auto=format&fit=crop",
    price: 128,
    oldPrice: null,
    tags: ["300W", "Pole Mount", "Outdoor"],
    badge: "hot",
    rating: 4.8,
    sortOrder: 2,
  },
  {
    id: "prd_008",
    title: "Split Solar Street Light 400W",
    category: "solar-street-lights",
    categoryLabel: "Solar Street Light",
    useCase: "Project Install",
    description:
      "Split-body solar street light for larger compounds and municipal installs that need longer autonomy.",
    imageUrl:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80&auto=format&fit=crop",
    price: 162,
    oldPrice: 178,
    tags: ["400W", "Project", "Long Runtime"],
    badge: "new",
    rating: 4.8,
    sortOrder: 6,
  },
  {
    id: "prd_009",
    title: "Monocrystalline Solar Panel 550W",
    category: "solar-systems",
    categoryLabel: "Solar System",
    useCase: "Power Generation",
    description:
      "High-efficiency monocrystalline panel for dependable rooftop and project-scale energy generation.",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80&auto=format&fit=crop",
    price: 145,
    oldPrice: 159,
    tags: ["550W", "Mono", "High Efficiency"],
    badge: "sale",
    rating: 4.9,
    sortOrder: 3,
  },
  {
    id: "prd_010",
    title: "Hybrid Solar Panel Kit 200W",
    category: "solar-systems",
    categoryLabel: "Solar System Kit",
    useCase: "Portable Backup",
    description:
      "Compact panel kit for cabin backup, mobile stalls, and smaller appliances that need fast deployment.",
    imageUrl:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80&auto=format&fit=crop",
    price: 92,
    oldPrice: 101,
    tags: ["200W", "Portable", "Kit"],
    badge: "new",
    rating: 4.6,
    sortOrder: 11,
  },
  {
    id: "prd_011",
    title: "LiFePO4 Solar Battery 100Ah",
    category: "solar-systems",
    categoryLabel: "Solar Battery",
    useCase: "Backup Power",
    description:
      "Reliable LiFePO4 battery for solar backup systems with long cycle life and stable discharge.",
    imageUrl:
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=1200&q=80&auto=format&fit=crop",
    price: 289,
    oldPrice: null,
    tags: ["100Ah", "LiFePO4", "Backup"],
    badge: "new",
    rating: 4.7,
    sortOrder: 9,
  },
  {
    id: "prd_012",
    title: "Deep Cycle Gel Battery 200Ah",
    category: "solar-systems",
    categoryLabel: "Solar Battery",
    useCase: "Backup Power",
    description:
      "Large-capacity gel battery for heavier inverter systems and multi-load solar storage installations.",
    imageUrl:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&q=80&auto=format&fit=crop",
    price: 245,
    oldPrice: 268,
    tags: ["200Ah", "Deep Cycle", "Stable Output"],
    badge: "sale",
    rating: 4.7,
    sortOrder: 12,
  },
  {
    id: "prd_013",
    title: "MPPT Charge Controller 60A",
    category: "drivers-accessories",
    categoryLabel: "Driver / Accessory",
    useCase: "System Protection",
    description:
      "Smart MPPT controller with LCD status readout to manage panel input and battery charging efficiently.",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
    price: 64,
    oldPrice: 72,
    tags: ["60A", "MPPT", "LCD"],
    badge: "hot",
    rating: 4.8,
    sortOrder: 13,
  },
  {
    id: "prd_014",
    title: "Solar Garden Light Set",
    category: "decorative-lights",
    categoryLabel: "Decorative Light",
    useCase: "Landscape",
    description:
      "Decorative solar light set for pathways, fences, cafes, and outdoor corners that need warm atmosphere.",
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80&auto=format&fit=crop",
    price: 22,
    oldPrice: 28,
    tags: ["Garden", "Solar", "Set"],
    badge: "new",
    rating: 4.7,
    sortOrder: 14,
  },
];

const productTranslations: Record<
  string,
  Pick<Product, "titleKm" | "categoryLabelKm" | "useCaseKm" | "descriptionKm">
> = {
  prd_001: {
    titleKm: "អំពូល LED EcoBright 12W",
    categoryLabelKm: "អំពូល LED",
    useCaseKm: "ភ្លើងក្នុងផ្ទះ",
    descriptionKm:
      "អំពូលភ្លឺ សន្សំថាមពល សម្រាប់ប្រើប្រាស់ប្រចាំថ្ងៃក្នុងផ្ទះ និងការិយាល័យ។",
  },
  prd_002: {
    titleKm: "អំពូល LED EcoBright 20W",
    categoryLabelKm: "អំពូល LED",
    useCaseKm: "ហាង និងការិយាល័យ",
    descriptionKm:
      "អំពូលកម្លាំងខ្ពស់ ផ្តល់ពន្លឺសស្អាតសម្រាប់ហាង បញ្ជរ ផ្ទះបាយ និងកន្លែងធ្វើការ។",
  },
  prd_003: {
    titleKm: "បំពង់ LED T8 20W",
    categoryLabelKm: "បំពង់ LED",
    useCaseKm: "ហាង និងការិយាល័យ",
    descriptionKm:
      "បំពង់ LED រឹងមាំ សម្រាប់ហាង ឃ្លាំង និងការិយាល័យ ជាមួយពន្លឺស្មើៗគ្នា។",
  },
  prd_004: {
    titleKm: "បំពង់ LED ស្លីម T5 10W",
    categoryLabelKm: "បំពង់ LED",
    useCaseKm: "ភ្លើងទូ និងធ្នើ",
    descriptionKm:
      "បំពង់តូចសម្រាប់ទូ ដាក់បង្ហាញ និងកន្លែងចង្អៀត ដែលត្រូវការពន្លឺស្អាត។",
  },
  prd_005: {
    titleKm: "ភ្លើងហ្វ្លដ៍សូឡា 200W",
    categoryLabelKm: "ភ្លើងហ្វ្លដ៍សូឡា",
    useCaseKm: "សុវត្ថិភាពក្រៅអាគារ",
    descriptionKm:
      "ភ្លើងហ្វ្លដ៍សូឡាកម្លាំងខ្ពស់ មាន remote ធន់អាកាសធាតុ និងបំភ្លឺពេលយប់បានល្អ។",
  },
  prd_006: {
    titleKm: "ភ្លើងហ្វ្លដ៍សូឡា 100W មានចាប់ចលនា",
    categoryLabelKm: "ភ្លើងហ្វ្លដ៍សូឡា",
    useCaseKm: "សុវត្ថិភាពក្រៅអាគារ",
    descriptionKm:
      "ភ្លើងហ្វ្លដ៍មានមុខងារចាប់ចលនា សម្រាប់ច្រកទ្វារ បរិវេណ និងផ្លូវចូលផ្ទះ។",
  },
  prd_007: {
    titleKm: "ភ្លើងផ្លូវសូឡា 300W",
    categoryLabelKm: "ភ្លើងផ្លូវសូឡា",
    useCaseKm: "ផ្លូវ និងទីធ្លា",
    descriptionKm:
      "ភ្លើងផ្លូវរួមបញ្ចូលគ្នា សម្រាប់ផ្លូវ វីឡា បរិវេណ និងខាងក្រៅឃ្លាំង។",
  },
  prd_008: {
    titleKm: "ភ្លើងផ្លូវសូឡាបំបែក 400W",
    categoryLabelKm: "ភ្លើងផ្លូវសូឡា",
    useCaseKm: "គម្រោងដំឡើង",
    descriptionKm:
      "ភ្លើងផ្លូវសូឡាប្រភេទបំបែក សម្រាប់បរិវេណធំ និងគម្រោងដែលត្រូវការថាមពលយូរ។",
  },
  prd_009: {
    titleKm: "បន្ទះសូឡា Monocrystalline 550W",
    categoryLabelKm: "ប្រព័ន្ធសូឡា",
    useCaseKm: "ផលិតថាមពល",
    descriptionKm:
      "បន្ទះសូឡាប្រសិទ្ធភាពខ្ពស់ សម្រាប់ដំបូល និងគម្រោងផលិតថាមពលដែលទុកចិត្តបាន។",
  },
  prd_010: {
    titleKm: "ឈុតបន្ទះសូឡា Hybrid 200W",
    categoryLabelKm: "ឈុតប្រព័ន្ធសូឡា",
    useCaseKm: "ថាមពលបម្រុងចល័ត",
    descriptionKm:
      "ឈុតបន្ទះសូឡាតូច សម្រាប់ផ្ទះកម្សាន្ត តូបចល័ត និងឧបករណ៍តូចៗដែលត្រូវការដំឡើងលឿន។",
  },
  prd_011: {
    titleKm: "ថ្មសូឡា LiFePO4 100Ah",
    categoryLabelKm: "ថ្មសូឡា",
    useCaseKm: "ថាមពលបម្រុង",
    descriptionKm:
      "ថ្ម LiFePO4 ដែលទុកចិត្តបាន សម្រាប់ប្រព័ន្ធសូឡាបម្រុង ជាមួយអាយុកាលប្រើប្រាស់យូរ។",
  },
  prd_012: {
    titleKm: "ថ្ម Gel Deep Cycle 200Ah",
    categoryLabelKm: "ថ្មសូឡា",
    useCaseKm: "ថាមពលបម្រុង",
    descriptionKm:
      "ថ្ម Gel ចំណុះធំ សម្រាប់ប្រព័ន្ធ inverter ធំ និងការផ្ទុកថាមពលសូឡាច្រើនបន្ទុក។",
  },
  prd_013: {
    titleKm: "ឧបករណ៍បញ្ជាសាក MPPT 60A",
    categoryLabelKm: "ឌ្រាយវឺរ និងគ្រឿងបន្លាស់",
    useCaseKm: "ការពារប្រព័ន្ធ",
    descriptionKm:
      "ឧបករណ៍ MPPT ឆ្លាតវៃមានអេក្រង់ LCD សម្រាប់គ្រប់គ្រងចរន្តពីបន្ទះសូឡា និងការសាកថ្ម។",
  },
  prd_014: {
    titleKm: "ឈុតភ្លើងសួនសូឡា",
    categoryLabelKm: "ភ្លើងតុបតែង",
    useCaseKm: "តុបតែងទេសភាព",
    descriptionKm:
      "ឈុតភ្លើងសូឡាតុបតែង សម្រាប់ផ្លូវដើរ របង ហាងកាហ្វេ និងជ្រុងក្រៅអាគារ។",
  },
};

export const products: Product[] = productSeeds.map((product, index) => ({
  ...product,
  ...productTranslations[product.id],
  currency: CURRENCY,
  inStock: true,
  isActive: true,
  sortOrder: product.sortOrder ?? index + 1,
  createdOrder: productSeeds.length - index,
}));
