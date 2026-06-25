import React from 'react';

const ProductTable = ({ products, loading }) => {
  if (products.length === 0 && !loading) {
    return (
      <div className="empty-state">
        <h3>No Products Found</h3>
        <p>No items match your criteria. Try changing the category filter.</p>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="table-wrapper">
      <div className="table-scroll">
        <table className="product-table">
          <thead>
            <tr>
              <th className="col-name">Name</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className="col-name">
                    <div className="skeleton skeleton-text skeleton-name"></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-badge"></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-text skeleton-price" style={{ marginLeft: 'auto' }}></div>
                  </td>
                  <td>
                    <div className="skeleton skeleton-text skeleton-date"></div>
                  </td>
                </tr>
              ))
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="col-name">{product.name}</td>
                  <td>
                    <span className="tag-category">{product.category}</span>
                  </td>
                  <td className="col-price" style={{ textAlign: 'right' }}>
                    {formatPrice(product.price)}
                  </td>
                  <td className="col-date">{formatDate(product.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
