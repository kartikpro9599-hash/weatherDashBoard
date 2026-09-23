import { useState, useCallback } from "react";
import { X } from "lucide-react";
import EmptyState from "./EmptyState";
import ConfirmModal from "./ConfirmModal";
import "./SearchHistory.css";

export default function SearchHistory({
  history,
  historyLoading,
  onSelect,
  onDelete,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleDeleteClick = useCallback((city) => {
    setPendingDelete(city);
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingDelete) {
      onDelete(pendingDelete);
    }
    setPendingDelete(null);
  }, [pendingDelete, onDelete]);

  const handleCancel = useCallback(() => {
    setPendingDelete(null);
  }, []);

  // Don't render the section at all while loading with no existing data
  if (historyLoading && history.length === 0) {
    return (
      <section className="search-history" aria-label="Recent searches">
        <h3 className="search-history__title">Recent Searches</h3>
        <div className="search-history__skeleton-row">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton search-history__skeleton-chip" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="search-history" aria-label="Recent searches">
        <h3 className="search-history__title">Recent Searches</h3>

        {history.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="search-history__list">
            {history.map((item) => (
              <div key={item.city} className="search-history__chip">
                <button
                  className="search-history__chip-btn"
                  onClick={() => onSelect(item.city)}
                  title={`Search weather for ${item.city}`}
                >
                  {item.city}
                </button>
                <button
                  className="search-history__delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(item.city);
                  }}
                  aria-label={`Remove ${item.city} from history`}
                  title="Remove from history"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={!!pendingDelete}
        title="Delete search history?"
        message={`Are you sure you want to remove ${pendingDelete} from your recent searches?`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
