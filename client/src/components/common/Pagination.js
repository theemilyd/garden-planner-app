import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Reusable pagination component for handling large data sets
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {number} props.maxVisiblePages - Maximum number of page buttons to show
 * @param {string} props.size - Size of pagination component ('sm', 'lg', or undefined)
 * @param {boolean} props.showFirstLast - Whether to show first/last page buttons
 * @param {string} props.className - Additional CSS classes
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  size,
  showFirstLast = true,
  className = ''
}) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;
  
  // Ensure currentPage is within valid range
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  
  // Calculate the range of page numbers to display
  const getPageRange = () => {
    // If we can show all pages
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate start and end page numbers
    let startPage = Math.max(1, validCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    // Adjust if endPage exceeds totalPages
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  const pageRange = getPageRange();
  
  // Handle page change
  const handlePageChange = (page) => {
    if (page !== validCurrentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  return (
    <BootstrapPagination size={size} className={`justify-content-center ${className}`}>
      {/* First page button */}
      {showFirstLast && (
        <BootstrapPagination.First
          onClick={() => handlePageChange(1)}
          disabled={validCurrentPage === 1}
        />
      )}
      
      {/* Previous page button */}
      <BootstrapPagination.Prev
        onClick={() => handlePageChange(validCurrentPage - 1)}
        disabled={validCurrentPage === 1}
      />
      
      {/* Show ellipsis if start page is not 1 */}
      {pageRange[0] > 1 && (
        <>
          <BootstrapPagination.Item onClick={() => handlePageChange(1)}>
            1
          </BootstrapPagination.Item>
          {pageRange[0] > 2 && <BootstrapPagination.Ellipsis disabled />}
        </>
      )}
      
      {/* Page number buttons */}
      {pageRange.map(page => (
        <BootstrapPagination.Item
          key={page}
          active={page === validCurrentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </BootstrapPagination.Item>
      ))}
      
      {/* Show ellipsis if end page is not totalPages */}
      {pageRange[pageRange.length - 1] < totalPages && (
        <>
          {pageRange[pageRange.length - 1] < totalPages - 1 && (
            <BootstrapPagination.Ellipsis disabled />
          )}
          <BootstrapPagination.Item onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </BootstrapPagination.Item>
        </>
      )}
      
      {/* Next page button */}
      <BootstrapPagination.Next
        onClick={() => handlePageChange(validCurrentPage + 1)}
        disabled={validCurrentPage === totalPages}
      />
      
      {/* Last page button */}
      {showFirstLast && (
        <BootstrapPagination.Last
          onClick={() => handlePageChange(totalPages)}
          disabled={validCurrentPage === totalPages}
        />
      )}
    </BootstrapPagination>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxVisiblePages: PropTypes.number,
  size: PropTypes.string,
  showFirstLast: PropTypes.bool,
  className: PropTypes.string
};

export default Pagination; 