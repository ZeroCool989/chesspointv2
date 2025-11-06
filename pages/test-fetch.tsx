import { useState } from "react";

export default function TestFetch() {
  const [result, setResult] = useState<string>("");

  const testDirectFetch = async () => {
    console.log("🧪 TEST: Starting direct fetch test...");
    const API = "http://localhost:4001";
    const url = `${API}/auth/register`;

    console.log("🧪 TEST: URL:", url);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          username: "testuser",
        }),
      });

      console.log("🧪 TEST: Response status:", res.status);
      const data = await res.json();
      console.log("🧪 TEST: Response data:", data);

      setResult(`✅ Status: ${res.status}, Data: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      console.error("🧪 TEST: Error:", error);
      setResult(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Direct Fetch Test</h1>
      <button
        onClick={testDirectFetch}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          background: "#7B5AF0",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Test Direct Fetch
      </button>
      <pre style={{ marginTop: "2rem", background: "#f5f5f5", padding: "1rem" }}>
        {result || "Click button to test..."}
      </pre>
    </div>
  );
}
