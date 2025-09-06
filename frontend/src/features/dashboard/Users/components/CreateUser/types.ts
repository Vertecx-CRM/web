import { User } from "../../types";

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}
