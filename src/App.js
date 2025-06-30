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
  async function checkCookie() {
      const liat = document.getElementById("liat").value;
      const res = await fetch("https://linkedin-cookiee-checker-1.onrender.com/check-liat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ li_at: liat })
      });
      const data = await res.json();
      document.getElementById("cookie-result").textContent = data.message || data.error;
    }

  async function scrapePosts() {
        const liat = document.getElementById("liat").value;
        const keyword = document.getElementById("keyword").value;
        const result = document.getElementById("scrape-result");
        const list = document.getElementById("posts");
        list.innerHTML = "";
        result.textContent = "Scraping...";

        const res = await fetch("https://linkedin-cookiee-checker-1.onrender.com/scrape-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ li_at: liat, keyword: keyword })
        });
        const data = await res.json();

        if (data.success) {
          result.textContent = "Scraped Posts:";
          data.posts.forEach(post => {
            const li = document.createElement("li");
            li.textContent = post.text;
            list.appendChild(li);
          });
        } else {
          result.textContent = `❌ ${data.error}`;
        }
      }

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
            <div>
              <h2>LinkedIn Cookie Validator & Post Scraper</h2>
              <label>li_at Cookie:</label><br>
              </br>
              <input type="text" id="liat" placeholder="Paste li_at cookie" size="80"/><br />
              <button onclick="checkCookie()">Check Cookie</button>
              <p id="cookie-result"></p>

              <hr />
              <label>Search Keyword:</label><br />
              <input type="text" id="keyword" placeholder="e.g. AI, startup, hiring" size="50" />
              <button onclick="scrapePosts()">Scrape Posts</button>
              <p id="scrape-result"></p>
              <ul id="posts"></ul>
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
