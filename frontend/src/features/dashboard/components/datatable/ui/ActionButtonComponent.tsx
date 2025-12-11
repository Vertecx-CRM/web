import Image from "next/image";
import { useState } from "react";

export function ActionButtonComponent({
  icon,
  title,
  onClick,
  disabled = false,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      {disabled && showTooltip && (
        <div
          className="
            absolute top-8 left-1/2 -translate-x-1/2
            bg-gray-800 text-white text-[10px] px-2 py-1 
            rounded-md shadow-lg whitespace-nowrap z-50 opacity-90
          "
        >
          {title}
        </div>
      )}

      <button
        className={
          disabled
            ? "p-2 rounded-full opacity-40 cursor-not-allowed"
            : "p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-300/60"
        }
        onMouseEnter={() => disabled && setShowTooltip(true)}
        onMouseLeave={() => disabled && setShowTooltip(false)}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          onClick();
        }}
      >
        <Image
          src={icon}
          alt={`${title} icon`}
          className="h-4 w-4"
          width={16}
          height={16}
        />
      </button>
    </div>
  );
}
