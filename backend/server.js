const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const app = express();

app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Employee Request Management API is running" });
});

// 1. GET /api/requests - Fetch all tickets for Dashboard
app.get("/api/requests", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("employee_request_table")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching requests:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
});

// 2. POST /api/requests - Submit new request to n8n
app.post("/api/requests", async (req, res) => {
  try {
    const { employee_name, employee_email, department, description } = req.body;

    // Validation
    if (!employee_name || !employee_email || !description) {
      return res.status(400).json({
        success: false,
        message: "employee_name, employee_email, and description are required",
      });
    }

    // n8n Webhook ko payload forward karna
    const payload = {
      employee_name,
      employee_email,
      department: department || "General",
      description,
      submitted_at: new Date().toISOString(),
    };

    const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, payload);

    return res.status(201).json({
      success: true,
      message: "Request processed successfully",
      data: n8nResponse.data,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to process request through automation workflow",
      error: error.response ? error.response.data : error.message,
    });
  }
});

// 3. PATCH /api/requests/:ticketId - Update Status Lifecycle (Open -> Active -> Finalized)
app.patch("/api/requests/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const updateData = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (status === "Finalized") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("employee_request_table")
      .update(updateData)
      .eq("ticket_id", ticketId)
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data,
    });
  } catch (error) {
    console.error("Error updating status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update ticket status",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});