import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Chess Academy - Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ 
        width: '200px', 
        height: '200px', 
        backgroundColor: '#3b82f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        Test Box
      </div>
    </div>
  );
}

export default TestApp;