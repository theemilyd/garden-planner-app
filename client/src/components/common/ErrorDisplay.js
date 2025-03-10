import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faWifi, 
  faServer, 
  faLock, 
  faSearch, 
  faExclamationCircle,
  faRedo
} from '@fortawesome/free-solid-svg-icons';

/**
 * A reusable component for displaying API errors in a user-friendly way
 * 
 * @param {Object} props - Component props
 * @param {Object} props.error - Error object from API call
 * @param {Function} props.onRetry - Optional callback function to retry the failed operation
 * @param {boolean} props.dismissible - Whether the error can be dismissed
 * @param {Function} props.onDismiss - Callback when error is dismissed
 * @param {string} props.className - Additional CSS classes
 */
const ErrorDisplay = ({ 
  error, 
  onRetry, 
  dismissible = false, 
  onDismiss, 
  className = '' 
}) => {
  if (!error) return null;
  
  // Determine the appropriate icon based on error type
  let icon = faExclamationCircle;
  let variant = 'danger';
  
  if (error.isOffline) {
    icon = faWifi;
    variant = 'warning';
  } else if (error.status >= 500) {
    icon = faServer;
    variant = 'danger';
  } else if (error.status === 401 || error.status === 403) {
    icon = faLock;
    variant = 'warning';
  } else if (error.status === 404) {
    icon = faSearch;
    variant = 'info';
  } else if (error.status === 429) {
    icon = faExclamationTriangle;
    variant = 'warning';
  }
  
  return (
    <Alert 
      variant={variant} 
      className={`error-display ${className}`}
      dismissible={dismissible}
      onClose={onDismiss}
    >
      <div className="d-flex align-items-center">
        <FontAwesomeIcon icon={icon} className="me-3" size="lg" />
        <div className="flex-grow-1">
          <p className="mb-1 fw-bold">{error.message}</p>
          {error.details && (
            <p className="mb-1 small">{error.details}</p>
          )}
          {error.isOffline && (
            <p className="mb-0 small text-muted">
              Your changes will be saved when you're back online.
            </p>
          )}
        </div>
        {onRetry && (
          <Button 
            variant={variant === 'danger' ? 'outline-light' : 'outline-dark'} 
            size="sm" 
            onClick={onRetry}
            className="ms-2"
          >
            <FontAwesomeIcon icon={faRedo} className="me-1" />
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default ErrorDisplay; 