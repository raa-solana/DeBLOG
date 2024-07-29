import React from 'react';
import { useNavigate } from 'react-router-dom';

const NoStoragePage: React.FC = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/settings');
  };

  return (
    <div className="no-storage">
      <h2>No Storage Found</h2>
      <button onClick={handleRedirect}>Go to Settings</button>
    </div>
  );
};

export default NoStoragePage;
