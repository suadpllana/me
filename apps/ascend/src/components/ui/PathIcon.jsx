import { Brain, Coins, Compass, Gift, Sparkles, Swords } from "lucide-react";

const ICONS = {
  religion: Sparkles,
  money: Coins,
  mind: Brain,
  body: Swords,
  wishlist: Gift,
};

// The emblem icon for a path (category) id. Falls back to a compass.
export default function PathIcon({ id, ...props }) {
  const Icon = ICONS[id] ?? Compass;
  return <Icon aria-hidden="true" {...props} />;
}
