import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container text-center my-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-body py-5">
              <h1 className="display-1 text-muted">404</h1>
              <h2 className="mb-4">Page Not Found</h2>
              <p className="lead mb-4">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/" className="btn btn-primary">
                  Go to Home
                </Link>
                <Link to="/gardens" className="btn btn-outline-success">
                  View My Gardens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;