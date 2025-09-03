import { User } from "../../types";

export interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  user: User | null;
}