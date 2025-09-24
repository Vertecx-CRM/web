import Image from "next/image";

export function ActionButtonComponent({
  icon,
  title,
  onClick,
}: {
  icon: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      className="p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
      title={title}
      onClick={onClick}
    >
      <Image
        src={icon}
        alt={`${title} icon`}
        className="h-4 w-4"
        width={16}
        height={16}
      />
    </button>
  );
}
