import { Clock } from "lucide-react";
import "./EmptyState.css";

export default function EmptyState() {
  return (
    <div className="empty-state">
      <Clock className="empty-state__icon" size={28} strokeWidth={1.5} />
      <p className="empty-state__title">No recent searches yet</p>
      <p className="empty-state__subtitle">Search for a city to see it here</p>
    </div>
  );
}
