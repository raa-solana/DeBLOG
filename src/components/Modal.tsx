import React from 'react';
import { Link } from 'react-router-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  articleUrl: string;
  onNavigateToList: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, message, articleUrl, onNavigateToList }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <p>{message}</p>
        <p>URL: <Link to={articleUrl}>{articleUrl}</Link></p>
        <button onClick={onNavigateToList}>Go to Article List</button>
      </div>
    </div>
  );
};

export default Modal;
