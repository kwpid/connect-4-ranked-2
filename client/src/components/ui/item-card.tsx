import * as React from "react";
import { ItemRarity, ItemAttribute } from "@/types/game";
import { cn } from "@/lib/utils";

interface ItemCardProps extends React.HTMLAttributes<HTMLDivElement> {
  rarity?: ItemRarity;
  attributes?: ItemAttribute[];
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

const rarityColors: Record<ItemRarity, string> = {
  common: "bg-gray-800",
  regular: "bg-green-500/20 border-green-500/30",
  special: "bg-blue-500/20 border-blue-500/30",
  deluxe: "bg-orange-500/20 border-orange-500/30",
  exotic: "bg-yellow-500/20 border-yellow-500/30",
  blackmarket: "bg-purple-500/20 border-purple-500/30",
  legacy: "bg-orange-600/20 border-orange-600/30",
};

const rarityBorderColors: Record<ItemRarity, string> = {
  common: "border-gray-700",
  regular: "border-green-500",
  special: "border-blue-500",
  deluxe: "border-orange-500",
  exotic: "border-yellow-500",
  blackmarket: "border-purple-500",
  legacy: "border-orange-600",
};

const attributeIcons: Record<ItemAttribute, string> = {
  certified: "🏆",
  painted: "🎨",
  animated: "✨",
  seasonal: "🎄",
  win_tracker: "📊",
};

export function ItemCard({ 
  rarity, 
  attributes = [], 
  children, 
  selected = false, 
  onClick, 
  className,
  ...props 
}: ItemCardProps) {
  const rarityClass = rarity ? rarityColors[rarity] : "bg-gray-800";
  const borderClass = selected 
    ? "border-blue-500 ring-2 ring-blue-500" 
    : rarity 
    ? rarityBorderColors[rarity] 
    : "border-gray-700";

  return (
    <div
      className={cn(
        "rounded-lg border-2 transition-all cursor-pointer hover:scale-105",
        rarityClass,
        borderClass,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {attributes && attributes.length > 0 && (
        <div className="absolute top-2 right-2 flex gap-1">
          {attributes.map((attr) => (
            <span key={attr} className="text-xs" title={attr}>
              {attributeIcons[attr]}
            </span>
          ))}
        </div>
      )}
      {children}
      {rarity && rarity !== 'common' && (
        <div className="px-2 py-1">
          <span className={cn(
            "text-xs font-semibold uppercase",
            rarity === 'regular' && "text-green-400",
            rarity === 'special' && "text-blue-400",
            rarity === 'deluxe' && "text-orange-400",
            rarity === 'exotic' && "text-yellow-400",
            rarity === 'blackmarket' && "text-purple-400",
            rarity === 'legacy' && "text-orange-500"
          )}>
            {rarity}
          </span>
        </div>
      )}
    </div>
  );
}
