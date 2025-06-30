import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleLoginButton = ({ onLoginSuccess }) => {
  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
    access_type: 'offline',
    prompt: 'consent', // forces re-consent screen every time
    redirect_uri: 'postmessage',  // 👈 this is the key// must match Google Cloud Console
    onSuccess: async ({ code }) => {
      try {
        console.log("Authorization Code received:", code);
        // console.log("redirection url ------> ",redirect_uri)
        const res = await axios.post('https://flask-test-app-oumd.onrender.com/exchange', { code });
        if (res.data.error) {
          alert(` ${res.data.error}\n Please try again. you didn't give permission to send emails.`);
          return;
        }else {
        console.log("User info:", res.data);
        onLoginSuccess(res.data); // { id, email }
        alert("Login successful! You can now proced ");
        }
      } catch (err) {
        alert("Login failed.");
        console.error("Exchange Error:", err.response?.data || err.message);
      }
    },
    onError: () => {
      alert('Google login failed');
    },
  });

  return <button onClick={() => login()}>Sign in with Google</button>;
};

export default GoogleLoginButton;
