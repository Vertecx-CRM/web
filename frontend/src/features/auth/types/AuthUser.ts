export interface AuthUser {
  userid: number;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  avatar?: string | null;
  roleid?: number;
  stateid?: number;
}
