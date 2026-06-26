export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  state: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
  }[];
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "card" | "transfer" | "ussd";
  paymentRef: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export const sampleOrders: Order[] = [
  {
    id: "NF-LX9A2-K3M1",
    userId: "usr-002",
    customerName: "Adaeze Okonkwo",
    customerEmail: "ada@naijafashion.ng",
    phone: "+234 802 111 2222",
    address: "22 Allen Avenue, Ikeja",
    state: "Lagos",
    items: [
      { productId: "ng-001", name: "Royal Agbada Set", price: 45000, quantity: 1, size: "XL", color: "Gold", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=200&q=80" },
      { productId: "ac-001", name: "Beaded Waist Beads", price: 3500, quantity: 2, size: "One Size", color: "Gold", image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&q=80" },
    ],
    subtotal: 52000,
    delivery: 0,
    total: 52000,
    status: "delivered",
    paymentMethod: "card",
    paymentRef: "PAY-XK291LM",
    createdAt: "2025-06-01",
    updatedAt: "2025-06-04",
  },
  {
    id: "NF-MN3B7-P9Q2",
    userId: "usr-003",
    customerName: "Emeka Nwosu",
    customerEmail: "emeka@naijafashion.ng",
    phone: "+234 803 222 3333",
    address: "5 Wuse Zone 6",
    state: "FCT - Abuja",
    items: [
      { productId: "mn-003", name: "Corporate Suit Set", price: 65000, quantity: 1, size: "L", color: "Charcoal", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80" },
    ],
    subtotal: 65000,
    delivery: 0,
    total: 65000,
    status: "shipped",
    paymentMethod: "transfer",
    paymentRef: "PAY-AB472KN",
    createdAt: "2025-06-15",
    updatedAt: "2025-06-17",
  },
  {
    id: "NF-RT5C1-W8H4",
    userId: "usr-004",
    customerName: "Fatima Bello",
    customerEmail: "fatima@naijafashion.ng",
    phone: "+234 804 333 4444",
    address: "10 Bompai Road",
    state: "Kano",
    items: [
      { productId: "ng-004", name: "Senator Kaftan Suit", price: 28000, quantity: 1, size: "XXL", color: "White", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80" },
      { productId: "mn-006", name: "Embroidered Kaftan Robe", price: 24000, quantity: 1, size: "XL", color: "Sky Blue", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80" },
    ],
    subtotal: 52000,
    delivery: 0,
    total: 52000,
    status: "processing",
    paymentMethod: "ussd",
    paymentRef: "PAY-ZQ901WX",
    createdAt: "2025-06-20",
    updatedAt: "2025-06-20",
  },
  {
    id: "NF-YJ8D4-N2V6",
    userId: "usr-002",
    customerName: "Adaeze Okonkwo",
    customerEmail: "ada@naijafashion.ng",
    phone: "+234 802 111 2222",
    address: "22 Allen Avenue, Ikeja",
    state: "Lagos",
    items: [
      { productId: "wm-002", name: "Bodycon Bandage Dress", price: 22000, quantity: 1, size: "M", color: "Black", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200&q=80" },
      { productId: "ac-002", name: "Leather Tote Bag", price: 25000, quantity: 1, size: "One Size", color: "Black", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80" },
    ],
    subtotal: 47000,
    delivery: 3500,
    total: 50500,
    status: "pending",
    paymentMethod: "card",
    paymentRef: "PAY-LM283QR",
    createdAt: "2025-06-24",
    updatedAt: "2025-06-24",
  },
  {
    id: "NF-KP2E9-S5T7",
    userId: "usr-005",
    customerName: "Chukwuemeka Eze",
    customerEmail: "chukwu@naijafashion.ng",
    phone: "+234 805 444 5555",
    address: "8 Oguta Road, Onitsha",
    state: "Anambra",
    items: [
      { productId: "mn-005", name: "Brocade Native Suit", price: 35000, quantity: 1, size: "L", color: "Royal Blue", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=200&q=80" },
    ],
    subtotal: 35000,
    delivery: 3500,
    total: 38500,
    status: "cancelled",
    paymentMethod: "card",
    paymentRef: "PAY-NB617HJ",
    createdAt: "2025-06-10",
    updatedAt: "2025-06-11",
    note: "Customer requested cancellation",
  },
  {
    id: "NF-QW6F3-M1R8",
    userId: "usr-003",
    customerName: "Emeka Nwosu",
    customerEmail: "emeka@naijafashion.ng",
    phone: "+234 803 222 3333",
    address: "5 Wuse Zone 6",
    state: "FCT - Abuja",
    items: [
      { productId: "mn-001", name: "Slim Fit Chinos", price: 13500, quantity: 2, size: "32", color: "Navy", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&q=80" },
      { productId: "mn-002", name: "Ankara Print Shirt", price: 9500, quantity: 1, size: "L", color: "Blue Print", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&q=80" },
    ],
    subtotal: 36500,
    delivery: 3500,
    total: 40000,
    status: "delivered",
    paymentMethod: "transfer",
    paymentRef: "PAY-VC394DF",
    createdAt: "2025-05-28",
    updatedAt: "2025-06-02",
  },
];

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};
