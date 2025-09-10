export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  service: boolean;
  image: string;
};

export const initialCart: CartItem[] = [
  {
    id: 1,
    name: "Victus HP SIO",
    price: 2000000,
    quantity: 1,
    service: true,
    image: "/assets/imgs/laptop.png",
  },
  {
    id: 2,
    name: "Lenovo Gaming",
    price: 4000000,
    quantity: 1,
    service: false,
    image: "/assets/imgs/laptop.png",
  },
  {
    id: 3,
    name: "MacBook Pro",
    price: 6000000,
    quantity: 1,
    service: false,
    image: "/assets/imgs/laptop.png",
  },
  {
    id: 4,
    name: "Lenovo Gaming",
    price: 4000000,
    quantity: 1,
    service: false,
    image: "/assets/imgs/laptop.png",
  },
  {
    id: 5,
    name: "MacBook Pro",
    price: 6000000,
    quantity: 1,
    service: false,
    image: "/assets/imgs/laptop.png",
  },
  {
    id: 6,
    name: "Lenovo Gaming",
    price: 4000000,
    quantity: 1,
    service: false,
    image: "/assets/imgs/laptop.png",
  },
  {
    id: 7,
    name: "MacBook Pro",
    price: 6000000,
    quantity: 1,
    service: false,
    image: "/assets/imgs/laptop.png",
  },
];
