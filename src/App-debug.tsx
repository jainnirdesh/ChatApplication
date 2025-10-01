import React from 'react';

function App() {
  const envVars = {
    VITE_SUPABASE_URL: (import.meta as any).env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: (import.meta as any).env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_SERVICE_ROLE_KEY: (import.meta as any).env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: '#333' }}>Debug: Chat Application</h1>
      <p style={{ color: '#666' }}>If you can see this, React is working!</p>
      
      <h2 style={{ color: '#333', marginTop: '30px' }}>Environment Variables:</h2>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        overflow: 'auto'
      }}>
        {JSON.stringify(envVars, null, 2)}
      </pre>
      
      <h2 style={{ color: '#333', marginTop: '30px' }}>Build Info:</h2>
      <p style={{ color: '#666' }}>
        Build Time: {new Date().toISOString()}<br/>
        Mode: {(import.meta as any).env.MODE}<br/>
        Base URL: {(import.meta as any).env.BASE_URL}
      </p>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        border: '1px solid #ddd', 
        borderRadius: '5px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Next Steps:</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
          <li>Verify environment variables are set in Vercel</li>
          <li>Check browser console for errors</li>
          <li>Restore original App.tsx once debugging is complete</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
