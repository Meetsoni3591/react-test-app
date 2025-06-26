import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from './GoogleLoginButton';

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('gmail_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLoginSuccess = (data) => {
    setUser(data);
    localStorage.setItem('gmail_user', JSON.stringify(data));
  };

  return (
    <GoogleOAuthProvider clientId="223161771777-ceghj7lbjr7b4g5nln4g5lom0032ko60.apps.googleusercontent.com">
      <div>
        {!user ? (
          <GoogleLoginButton onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div>
             <p>Logged in as: {user.email}</p>
            {/* <h2>Welcome, {user.id}</h2> */}
            <button onClick={async () => {
                await fetch('http://localhost:8000/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user.id, email: user.email })
                });
            }}>
              Send Mail 
            </button>
            <br />
            <br />
            <button onClick={() => {
              localStorage.removeItem('gmail_user');
              setUser(null);
            }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
