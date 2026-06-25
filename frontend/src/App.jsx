import React, { useState, useEffect } from 'react';
import CategoryFilter from './components/CategoryFilter';
import ProductTable from './components/ProductTable';
import LoadMoreButton from './components/LoadMoreButton';

function App() {
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchProducts = async (selectedCategory, currentCursor, reset = false) => {
    setLoading(true);
    try {
      const url = new URL('/api/products', window.location.origin);
      if (selectedCategory) {
        url.searchParams.append('category', selectedCategory);
      }
      if (currentCursor) {
        url.searchParams.append('cursor', currentCursor);
      }
      url.searchParams.append('limit', '20');

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error('API fetch failed');
      }
      const json = await res.json();
      
      if (reset) {
        setProducts(json.data);
      } else {
        setProducts((prev) => [...prev, ...json.data]);
      }
      setCursor(json.nextCursor);
      setHasMore(json.nextCursor !== null);
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setLoading(false);
    }
  };

  // Reset and fetch first page on category change
  useEffect(() => {
    setProducts([]);
    setCursor(null);
    setHasMore(false);
    fetchProducts(category, null, true);
  }, [category]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchProducts(category, cursor, false);
    }
  };

  return (
    <div className="dashboard">
      <div className="header-section">
        <div className="title-area">
          <h1>Stellar Inventory</h1>
          <p>Real-time product exploration portal, powered by cursor pagination</p>
        </div>
        <CategoryFilter
          selectedCategory={category}
          onCategoryChange={setCategory}
        />
      </div>

      <ProductTable products={products} loading={loading} />
      <LoadMoreButton
        onLoadMore={handleLoadMore}
        loading={loading}
        hasMore={hasMore}
      />
    </div>
  );
}

export default App;
