import React from 'react';

const LoadMoreButton = ({ onLoadMore, loading, hasMore }) => {
  if (!hasMore) return null;

  return (
    <div className="actions-section">
      <button
        id="btn-load-more"
        className="btn-load-more"
        onClick={onLoadMore}
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="spinner"></div>
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;
