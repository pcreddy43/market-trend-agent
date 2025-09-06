import React from 'react';
import { Alert } from 'antd';

export default function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <Alert
      message="Error"
      description={typeof error === 'string' ? error : error.message || 'An error occurred.'}
      type="error"
      showIcon
      style={{ margin: '16px 0' }}
    />
  );
}
