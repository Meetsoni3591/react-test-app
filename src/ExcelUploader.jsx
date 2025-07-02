import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";

const EMAIL_REGEX = /^[\w.-]+@[\w.-]+\.\w+$/;
const IGNORE_EMAILS = ["none", "n/a", "nan"];

const ExcelUploader = ({ onEmailsExtracted, onInvalidEmails }) => {
  const [excelData, setExcelData] = useState([]);
  const [filename, setFilename] = useState("");
  const [invalidEmails, setInvalidEmails] = useState([]);
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.size === 0) {
      alert("The uploaded file is empty.");
      setFilename("");
      setExcelData([]);
      setInvalidEmails([]);
      onEmailsExtracted([]);
      if (onInvalidEmails) onInvalidEmails([]);
      return;
    }
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      if (!parsedData || parsedData.length === 0) {
        alert("The uploaded file is empty.");
        setExcelData([]);
        setInvalidEmails([]);
        onEmailsExtracted([]);
        if (onInvalidEmails) onInvalidEmails([]);
        return;
      }
      // Validate emails in uploaded file and collect invalids with row number
      const invalids = [];
      parsedData.forEach((row, idx) => {
        let email = row.Email || row.email || row["Post contact Email"];
        if (typeof email === "string") email = email.trim();
        if (
          email &&
          !IGNORE_EMAILS.includes(email.toLowerCase()) &&
          !EMAIL_REGEX.test(email)
        ) {
          invalids.push({ row: idx + 1, email });
        }
      });
      setExcelData(parsedData);
      setInvalidEmails(invalids);
      if (onInvalidEmails) onInvalidEmails(invalids);
      // Extract valid emails (ignore blanks and ignore list)
      const extractedEmails = parsedData
        .map((row) => {
          let email = row.Email || row.email || row["Post contact Email"];
          if (typeof email === "string") email = email.trim();
          return email;
        })
        .filter(
          (email) =>
            typeof email === "string" &&
            email &&
            !IGNORE_EMAILS.includes(email.toLowerCase()) &&
            EMAIL_REGEX.test(email)
        );
      onEmailsExtracted(extractedEmails);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="excel-upload-section">
      <form
        className={`excel-drag-area${dragActive ? " drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onSubmit={e => e.preventDefault()}
        style={{ width: '100%' }}
      >
        <div className="excel-upload-center">
          <div className="excel-upload-icon">
            {/* Upload SVG icon */}
            <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#F3F6FC" />
              <path d="M24 15v14m0 0l-5-5m5 5l5-5" stroke="#7B8BBD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="excel-upload-title">Drag and drop your Excel file here</div>
          <div className="excel-upload-sub">or click to browse your files</div>
          <label className="excel-upload-btn">
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={e => handleFile(e.target.files[0])}
            />
            <span> <svg width="18" height="18" fill="none" style={{marginRight: 6, verticalAlign: 'middle'}} xmlns="http://www.w3.org/2000/svg"><path d="M3 9.75V15a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0015 15V9.75" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7.5L9 4.5 6 7.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 4.5V13.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Choose File</span>
          </label>
          <div className="excel-upload-info">Supported formats: <b>.xlsx</b>, <b>.xls</b> (Max size: 10MB)</div>
          {filename && <div className="excel-upload-filename">📁 <b>{filename}</b></div>}
        </div>
      </form>
      {/* Show table if data exists */}
      {excelData.length > 0 && (
        <div className="excel-table-wrapper">
          <table className="excel-table">
            <thead>
              <tr>
                {Object.keys(excelData[0]).map((key) => (
                  <th
                    key={key}
                    className={
                      key.toLowerCase().includes('email')
                        ? 'email-col'
                        : key.toLowerCase().includes('author link')
                        ? 'post-author-link-col'
                        : ''
                    }
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.keys(excelData[0]).map((key) => {
                    const isEmail = key.toLowerCase().includes('email');
                    const isAuthorLink = key.toLowerCase().includes('author link');
                    let email = row[key];
                    let invalid = false;
                    if (isEmail && typeof email === 'string' && email.trim() && !IGNORE_EMAILS.includes(email.toLowerCase()) && !EMAIL_REGEX.test(email)) {
                      invalid = true;
                    }
                    return (
                      <td
                        key={key}
                        className={
                          isEmail
                            ? 'email-col'
                            : isAuthorLink
                            ? 'post-author-link-col'
                            : ''
                        }
                      >
                        {isEmail ? (
                          <input
                            type="email"
                            className={`excel-table-input${invalid ? ' invalid' : ''}`}
                            value={row[key] || ''}
                            onChange={e => {
                              const newValue = e.target.value;
                              setExcelData(prevData => {
                                const updated = [...prevData];
                                updated[rowIndex] = { ...updated[rowIndex], [key]: newValue };
                                // Validate all emails after change
                                const invalids = [];
                                updated.forEach((r, idx) => {
                                  let email = r.Email || r.email || r["Post contact Email"];
                                  if (typeof email === "string") email = email.trim();
                                  if (
                                    email &&
                                    !IGNORE_EMAILS.includes(email.toLowerCase()) &&
                                    !EMAIL_REGEX.test(email)
                                  ) {
                                    invalids.push({ row: idx + 1, email });
                                  }
                                });
                                setInvalidEmails(invalids);
                                if (onInvalidEmails) onInvalidEmails(invalids);
                                // Extract valid emails
                                const extractedEmails = updated
                                  .map((r) => {
                                    let email = r.Email || r.email || r["Post contact Email"];
                                    if (typeof email === "string") email = email.trim();
                                    return email;
                                  })
                                  .filter(
                                    (email) =>
                                      typeof email === "string" &&
                                      email &&
                                      !IGNORE_EMAILS.includes(email.toLowerCase()) &&
                                      EMAIL_REGEX.test(email)
                                  );
                                onEmailsExtracted(extractedEmails);
                                return updated;
                              });
                            }}
                            style={{ width: '100%' }}
                          />
                        ) : (
                          row[key]
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {invalidEmails.length > 0 && (
            <div className="excel-invalid-msg">
              <strong>⚠️ Invalid email formats found:</strong>
              <ul>
                {invalidEmails.map(({ row, email }, idx) => (
                  <li key={idx}>Row {row}: <code>{email}</code></li>
                ))}
              </ul>
              <div className="excel-invalid-hint">Please correct the invalid email(s) above before sending.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;
