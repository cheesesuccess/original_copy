import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// DPO Credentials
const DPO_MERCHANT_ID = "5525";
const DPO_COMPANY_TOKEN = "8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3"; // Provided by DPO

// Verify payment route
app.post("/verify-payment", async (req, res) => {
  const { companyRef } = req.body;
  if (!companyRef) return res.status(400).json({ error: "CompanyRef required" });

  try {
    // Call DPO Query API (JSON request example)
    const response = await axios.post(
      "https://secure.3gdirectpay.com/API/v6/",
      {
        CompanyToken: DPO_COMPANY_TOKEN,
        Request: {
          TransactionToken: companyRef,
          TransactionAction: "QUERY"
        }
      },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json(response.data); // Send result back to frontend
  } catch (error) {
    console.error("DPO API Error:", error.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Start backend
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
