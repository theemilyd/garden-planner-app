import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling pagination logic
 * 
 * @param {Object} options - Pagination options
 * @param {Array} options.data - Full data array to paginate
 * @param {number} options.initialPage - Initial page number (1-based)
 * @param {number} options.itemsPerPage - Number of items per page
 * @param {Function} options.fetchData - Optional function to fetch data for server-side pagination
 * @param {number} options.totalItems - Total number of items (required for server-side pagination)
 * @returns {Object} - Pagination state and handlers
 */
const usePagination = ({
  data = [],
  initialPage = 1,
  itemsPerPage = 10,
  fetchData = null,
  totalItems = null
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [paginatedData, setPaginatedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Determine if we're using client-side or server-side pagination
  const isServerSide = !!fetchData;
  
  // Calculate total pages
  const totalPages = isServerSide
    ? Math.ceil(totalItems / itemsPerPage)
    : Math.ceil(data.length / itemsPerPage);
  
  // Client-side pagination logic
  const updateClientPagination = useCallback(() => {
    if (!data || data.length === 0) {
      setPaginatedData([]);
      return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const slicedData = data.slice(startIndex, endIndex);
    
    setPaginatedData(slicedData);
  }, [data, currentPage, itemsPerPage]);
  
  // Server-side pagination logic
  const fetchServerPaginatedData = useCallback(async () => {
    if (!fetchData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchData({
        page: currentPage,
        limit: itemsPerPage
      });
      
      setPaginatedData(result.data || []);
    } catch (err) {
      setError(err);
      setPaginatedData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, currentPage, itemsPerPage]);
  
  // Update pagination when dependencies change
  useEffect(() => {
    if (isServerSide) {
      fetchServerPaginatedData();
    } else {
      updateClientPagination();
    }
  }, [isServerSide, updateClientPagination, fetchServerPaginatedData]);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    const newTotalPages = isServerSide
      ? Math.ceil(totalItems / newItemsPerPage)
      : Math.ceil(data.length / newItemsPerPage);
    
    // Adjust current page if it would exceed the new total pages
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    
    setCurrentPage(newCurrentPage);
  };
  
  // Reset to first page
  const resetPagination = () => {
    setCurrentPage(1);
  };
  
  return {
    currentPage,
    totalPages,
    paginatedData,
    isLoading,
    error,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
    itemsPerPage
  };
};

export default usePagination; 