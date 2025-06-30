import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelUploader = ({ onEmailsExtracted }) => {
  const [excelData, setExcelData] = useState([]);
  const [filename, setFilename] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      setExcelData(parsedData);

      // Extract email column values
      const extractedEmails = parsedData
        .map((row) => row.Email || row.email || row["Post contact Email"])
        .filter((email) => typeof email === "string" && email.includes("@"));

      // Send emails to parent
      onEmailsExtracted(extractedEmails);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <h3>Upload Excel File</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {filename && <p>📁 File Uploaded: <strong>{filename}</strong></p>}

      {excelData.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>📄 Excel File Preview:</h4>
          <div style={{ overflowX: "auto" }}>
            <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, index) => (
                  <tr key={index}>
                    {Object.keys(excelData[0]).map((key) => (
                      <td key={key}>{row[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {excelData.length === 0 && (
        <p style={{ color: "red" }}>❌ No valid email data found in the uploaded file.</p>  
      )}
    </div>
  );
};

export default ExcelUploader;
