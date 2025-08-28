// src/shared/auth/users.ts
export type UserRecord = {
  email: string;
  password: string;
  name: string;
  role?: string;
};

export const USERS: UserRecord[] = [
  { email: "admin@sistemaspc.com",   password: "123456",     name: "Administrador", role: "admin" },
  { email: "compras@sistemaspc.com", password: "compras2025", name: "Compras",      role: "buyer" },
];
