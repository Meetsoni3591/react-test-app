import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from './GoogleLoginButton';
import ExcelUploader from './ExcelUploader';
import SendEmailButton from './SendEmailButton';

function App() {
  const [emailList, setEmailList] = useState([]);
  const [invalidEmails, setInvalidEmails] = useState([]);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('gmail_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleEmailsExtracted = (emails) => {
    console.log("📧 Extracted Emails:", emails);
    setEmailList(emails);
  };
  const handleInvalidEmails = (invalids) => {
    setInvalidEmails(invalids);
  };
  const handleLoginSuccess = (data) => {
    setUser(data);
    localStorage.setItem('gmail_user', JSON.stringify(data));
  };

  return (
    <GoogleOAuthProvider clientId="223161771777-1ji9dj4v6jguma0s780iqadgia1fqc4c.apps.googleusercontent.com">
      <div>
        <h1>Send Mail App</h1>
        {!user ? (
          <GoogleLoginButton onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div>
             <p>Logged in as: {user.email}</p>
            {/* <h2>Welcome, {user.id}</h2> */}
            {/* test mail button  */}
            {/* <button
              onClick={async () => {
                try {
                  const response = await fetch('https://flask-test-app-oumd.onrender.com/send', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: user.id, email: user.email }),
                  });

                  const result = await response.json();
                  console.log("Response from server:", result);
                  console.log("Email received from backend:", result.email);
                  if (response.ok) {
                    alert(`📤 Mail sent to ${result.email} successfully!`);
                  } else {
                    alert(`❌ Failed to send mail: ${result.error || 'Unknown error'}`);
                  }
                } catch (error) {
                  console.error("Fetch error:", error);
                  alert("❌ An error occurred while sending the mail.");
                }
              }}
            >
              Send Mail
            </button> */}
            {/* <br /> */}
            {/* <br /> */}
            {/* <p>upload your excel file </p> */}
           
            <div>
              {/* <h2>Gmail Bulk Sender</h2> */}
              <ExcelUploader onEmailsExtracted={handleEmailsExtracted} onInvalidEmails={handleInvalidEmails} />

              {emailList.length > 0 && (
                <div>
                  <h3>Emails to be sent:</h3>
                  <ul>
                    {emailList.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                  <SendEmailButton emails={emailList} userId={user.id} disabled={invalidEmails.length > 0} />
                  {invalidEmails.length > 0 && (
                    <div style={{ color: '#b30000', marginTop: 10 }}>
                      <strong>Cannot send emails while there are invalid email addresses above.</strong>
                    </div>
                  )}
                </div>
              )}
              
            </div>



            <button onClick={() => {
              localStorage.removeItem('gmail_user');
              localStorage.clear(); // or clear tokens
              window.location.reload(); // reset session
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
