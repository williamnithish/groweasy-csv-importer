export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          color: "#2563eb",
          marginBottom: "1rem",
        }}
      >
        🚀 GrowEasy CSV Importer
      </h1>

      <p
        style={{
          fontSize: "1.2rem",
          color: "#555",
          marginBottom: "2rem",
        }}
      >
        Frontend deployment is working successfully.
      </p>

      <div
        style={{
          background: "#f5f5f5",
          padding: "1.5rem",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Deployment Status</h2>

        <p>✅ Next.js Running</p>
        <p>✅ Docker Running</p>
        <p>✅ Render Deployment Successful</p>
        <p>✅ Static Page Loaded</p>
      </div>
    </main>
  );
}