import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorDisplay from './ErrorDisplay';

describe('ErrorDisplay Component', () => {
  const mockError = {
    message: 'Test error message',
    details: 'Error details',
    status: 404,
    isOffline: false
  };
  
  const mockOfflineError = {
    message: 'You are offline',
    details: '',
    status: 0,
    isOffline: true
  };
  
  const mockRetry = jest.fn();
  const mockDismiss = jest.fn();
  
  beforeEach(() => {
    mockRetry.mockClear();
    mockDismiss.mockClear();
  });
  
  test('renders error message correctly', () => {
    render(<ErrorDisplay error={mockError} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Error details')).toBeInTheDocument();
  });
  
  test('renders offline error message correctly', () => {
    render(<ErrorDisplay error={mockOfflineError} />);
    
    expect(screen.getByText('You are offline')).toBeInTheDocument();
    expect(screen.getByText('Your changes will be saved when you\'re back online.')).toBeInTheDocument();
  });
  
  test('does not render when error is null', () => {
    const { container } = render(<ErrorDisplay error={null} />);
    
    expect(container.firstChild).toBeNull();
  });
  
  test('calls retry function when retry button is clicked', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockRetry} />);
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
  
  test('does not show retry button when onRetry is not provided', () => {
    render(<ErrorDisplay error={mockError} />);
    
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });
  
  test('calls dismiss function when close button is clicked', () => {
    render(<ErrorDisplay error={mockError} dismissible={true} onDismiss={mockDismiss} />);
    
    const closeButton = screen.getByLabelText('Close alert');
    fireEvent.click(closeButton);
    
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });
  
  test('uses correct variant based on error status', () => {
    const { rerender } = render(<ErrorDisplay error={{ ...mockError, status: 500 }} />);
    expect(screen.getByRole('alert')).toHaveClass('alert-danger');
    
    rerender(<ErrorDisplay error={{ ...mockError, status: 401 }} />);
    expect(screen.getByRole('alert')).toHaveClass('alert-warning');
    
    rerender(<ErrorDisplay error={{ ...mockError, status: 404 }} />);
    expect(screen.getByRole('alert')).toHaveClass('alert-info');
    
    rerender(<ErrorDisplay error={{ ...mockError, isOffline: true }} />);
    expect(screen.getByRole('alert')).toHaveClass('alert-warning');
  });
}); 