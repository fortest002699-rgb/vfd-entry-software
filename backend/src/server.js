const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const googleSheetRoutes = require("./routes/googleSheetRoutes");


// ------------------ ROUTES ------------------
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const pdfRoutes = require("./routes/pdfRoutes"); // ✅ Add PDF route

// ------------------ USE ROUTES ------------------
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/pdf", pdfRoutes); // ✅ Add PDF route
app.use("/api/sheets", googleSheetRoutes);

// ------------------ START SERVER ------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ DTS Backend running on port ${PORT}`);
});
