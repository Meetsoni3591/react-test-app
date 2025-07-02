import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from './GoogleLoginButton';
import ExcelUploader from './ExcelUploader';
import SendEmailButton from './SendEmailButton';
import './App.css';

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
  // async function checkCookie() {
  //     const liat = document.getElementById("liat").value;
  //     const res = await fetch("https://linkedin-cookiee-checker-1.onrender.com/check-liat", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ li_at: liat })
  //     });
  //     const data = await res.json();
  //     document.getElementById("cookie-result").textContent = data.message || data.error;
  //   }

  // async function scrapePosts() {
  //       const liat = document.getElementById("liat").value;
  //       const keyword = document.getElementById("keyword").value;
  //       const result = document.getElementById("scrape-result");
  //       const list = document.getElementById("posts");
  //       list.innerHTML = "";
  //       result.textContent = "Scraping...";

  //       const res = await fetch("https://linkedin-cookiee-checker-1.onrender.com/scrape-posts", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ li_at: liat, keyword: keyword })
  //       });
  //       const data = await res.json();

  //       if (data.success) {
  //         result.textContent = "Scraped Posts:";
  //         data.posts.forEach(post => {
  //           const li = document.createElement("li");
  //           li.textContent = post.text;
  //           list.appendChild(li);
  //         });
  //       } else {
  //         result.textContent = `❌ ${data.error}`;
  //       }
  //     }

  return (
    <GoogleOAuthProvider clientId="223161771777-1ji9dj4v6jguma0s780iqadgia1fqc4c.apps.googleusercontent.com">
      <div className="app-bg">
        {!user ? (
          <div className="login-card">
            {/* <div className="login-icon">
              <img src={require('./logo.svg').default} alt="Mail Icon" style={{ width: 56, height: 56 }} />
            </div> */}
            <h2 className="login-title">Send Mail App</h2>
            <p className="login-subtitle">Sign in to your account to continue</p>
            <div className="login-btn-wrapper">
              <GoogleLoginButton onLoginSuccess={handleLoginSuccess} />
            </div>
            {/* <div className="login-signup">
              Don't have an account? <a href="#" className="signup-link">Sign up for free</a>
            </div> */}
            <div className="login-footer">
              Protected by industry-standard encryption and security measures
            </div>
          </div>
        ) : (
          <div className="dashboard-bg">
            {/* Top Navbar */}
            <nav className="navbar">
              <div className="navbar-left">
                <span className="navbar-logo">
                  <img src={require('./logo.svg').default} alt="Mail Icon" style={{ width: 32, height: 32 }} />
                </span>
                <span className="navbar-title">Send Mail App</span>
              </div>
              <div className="navbar-right">
                <span className="navbar-user">
                  <span className="navbar-user-icon" role="img" aria-label="user">👤</span>
                  Logged in as: <b>{user.email}</b>
                </span>
                <button className="navbar-logout" onClick={() => {
                  localStorage.removeItem('gmail_user');
                  localStorage.clear();
                  window.location.reload();
                  setUser(null);
                }}>
                  <span role="img" aria-label="logout">↩️</span> Logout
                </button>
              </div>  
            </nav>

            {/* Main Card */}
            <div className="main-card">
              <h2 className="main-title">Upload Excel File</h2>
              <p className="main-subtitle">Upload your Excel file containing email addresses to send bulk emails</p>
              <div className="upload-area">
                <ExcelUploader onEmailsExtracted={handleEmailsExtracted} onInvalidEmails={handleInvalidEmails} />
              </div>
              <div className="send-email-btn-wrapper">
                <SendEmailButton emails={emailList} userId={user.id} disabled={invalidEmails.length > 0 || emailList.length === 0} />
              </div>
              <div className="instructions-section">
                <h3>Instructions</h3>
                <div className="instructions-columns">
                  <div>
                    <b>Excel File Format</b>
                    <ul>
                      <li>Include email addresses in the first column</li>
                      {/* <li>Add recipient names in the second column (optional)</li> */}
                      <li>Use .xlsx or .xls format</li>
                      <li>Maximum file size: 10MB</li>
                    </ul>
                  </div>
                  <div>
                    <b>Email Sending</b>
                    <ul>
                      <li>Bulk emails will be sent from your account</li>
                      <li>Processing time depends on list size</li>
                      <li>You'll receive a confirmation when complete</li>
                      {/* <li>Check spam folder for delivery reports</li> */}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </GoogleOAuthProvider>

  );
}

export default App;
