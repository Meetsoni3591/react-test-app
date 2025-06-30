import React, { useState } from "react";
import * as XLSX from "xlsx";

const EMAIL_REGEX = /^[\w.-]+@[\w.-]+\.\w+$/;
const IGNORE_EMAILS = ["none", "n/a", "nan"];

const ExcelUploader = ({ onEmailsExtracted, onInvalidEmails }) => {
  const [excelData, setExcelData] = useState([]);
  const [filename, setFilename] = useState("");
  const [invalidEmails, setInvalidEmails] = useState([]);

  return (
    <div style={{ margin: "20px 0" }}>
      <h3>Upload Excel File</h3>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={(event) => {
          const file = event.target.files[0];
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
        }}
      />

      {filename && <p>📁 File Uploaded: <strong>{filename}</strong></p>}

      {excelData.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>📄 Excel File Preview:</h4>
          <div>
            <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th
                      key={key}
                      style={
                        key.toLowerCase().includes("email")
                          ? { width: "180px", minWidth: "120px" }
                          : { width: "100px", maxWidth: "140px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
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
                    {Object.keys(excelData[0]).map((key) => (
                      <td
                        key={key}
                        style={
                          key.toLowerCase().includes("email")
                            ? { width: "180px", minWidth: "120px" }
                            : { width: "100px", maxWidth: "140px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
                        }
                      >
                        {(key.toLowerCase().includes("email")) ? (
                          <input
                            type="email"
                            value={row[key] || ""}
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
                            style={{ width: "100%" }}
                          />
                        ) : (
                          row[key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invalidEmails.length > 0 && (
            <div style={{ marginTop: "16px", color: "#b30000", background: "#fff3f3", border: "1px solid #ffcccc", borderRadius: "6px", padding: "12px" }}>
              <strong>⚠️ Invalid email formats found:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                {invalidEmails.map(({ row, email }, idx) => (
                  <li key={idx}>Row {row}: <code>{email}</code></li>
                ))}
              </ul>
              <div style={{ color: '#555', marginTop: 8 }}>Please correct the invalid email(s) above before sending.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;
