import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();
  
  beforeEach(() => {
    mockOnPageChange.mockClear();
  });
  
  test('renders pagination with correct number of pages', () => {
    render(
      <Pagination 
        currentPage={1} 
        totalPages={5} 
        onPageChange={mockOnPageChange} 
      />
    );
    
    // Should render 5 page buttons (1-5)
    expect(screen.getAllByRole('button').length).toBe(7); // 5 pages + prev + next
    
    // Check if page numbers are rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
  
  test('does not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination 
        currentPage={1} 
        totalPages={1} 
        onPageChange={mockOnPageChange} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });
  
  test('calls onPageChange when a page button is clicked', () => {
    render(
      <Pagination 
        currentPage={1} 
        totalPages={5} 
        onPageChange={mockOnPageChange} 
      />
    );
    
    // Click on page 3
    fireEvent.click(screen.getByText('3'));
    
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
  
  test('disables previous button on first page', () => {
    render(
      <Pagination 
        currentPage={1} 
        totalPages={5} 
        onPageChange={mockOnPageChange} 
      />
    );
    
    // Previous button should be disabled
    expect(screen.getByText('‹').closest('button')).toBeDisabled();
    
    // Next button should be enabled
    expect(screen.getByText('›').closest('button')).not.toBeDisabled();
  });
  
  test('disables next button on last page', () => {
    render(
      <Pagination 
        currentPage={5} 
        totalPages={5} 
        onPageChange={mockOnPageChange} 
      />
    );
    
    // Previous button should be enabled
    expect(screen.getByText('‹').closest('button')).not.toBeDisabled();
    
    // Next button should be disabled
    expect(screen.getByText('›').closest('button')).toBeDisabled();
  });
  
  test('shows ellipsis when there are many pages', () => {
    render(
      <Pagination 
        currentPage={5} 
        totalPages={10} 
        onPageChange={mockOnPageChange} 
        maxVisiblePages={3}
      />
    );
    
    // Should show ellipsis before and after visible pages
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBe(2);
  });
  
  test('handles size prop correctly', () => {
    render(
      <Pagination 
        currentPage={1} 
        totalPages={5} 
        onPageChange={mockOnPageChange} 
        size="sm"
      />
    );
    
    // Check if pagination has the correct size class
    expect(screen.getByRole('navigation')).toHaveClass('pagination-sm');
  });
  
  test('handles showFirstLast prop correctly', () => {
    const { rerender } = render(
      <Pagination 
        currentPage={3} 
        totalPages={5} 
        onPageChange={mockOnPageChange} 
        showFirstLast={true}
      />
    );
    
    // Should show first and last buttons
    expect(screen.getByText('«')).toBeInTheDocument();
    expect(screen.getByText('»')).toBeInTheDocument();
    
    // Re-render without first/last buttons
    rerender(
      <Pagination 
        currentPage={3} 
        totalPages={5} 
        onPageChange={mockOnPageChange} 
        showFirstLast={false}
      />
    );
    
    // Should not show first and last buttons
    expect(screen.queryByText('«')).not.toBeInTheDocument();
    expect(screen.queryByText('»')).not.toBeInTheDocument();
  });
}); 