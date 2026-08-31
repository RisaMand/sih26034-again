import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Toast = () => {
  const { toastMessage } = useAuth();
  if (!toastMessage) return null;
  return <div className="toast">{toastMessage}</div>;
};