import React, { useState } from "react";
import axios from "axios";

const SendEmailButton = ({ emails, userId }) => {
  const [loading, setLoading] = useState(false);

  const handleSendEmails = async () => {
    if (!userId || emails.length === 0) {
      alert("Missing user or email list.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("https://flask-test-app-oumd.onrender.com/send", {
        user_id: userId,
        emails: emails
      });

      alert("✅ Emails sent successfully!");
      console.log("Server response:", res.data);
    } catch (err) {
      alert("❌ Failed to send emails.",err.response?.data || err.message);
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={handleSendEmails} disabled={loading}>
        {loading ? "Sending Emails..." : `Send Email to ${emails.length} Recipients`}
      </button>
    </div>
  );
};

export default SendEmailButton;
