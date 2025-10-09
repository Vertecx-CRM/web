export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
  priority?: "high" | "medium" | "low";
  width?: string;
};
