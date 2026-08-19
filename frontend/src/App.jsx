import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Inbox, 
  ShieldCheck, 
  Tag, 
  User 
} from "lucide-react";

const API_BASE_URL = "https://employee-request.onrender.com/api/requests";

export default function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'Open', 'Active', 'Finalized'
  const [lastTicket, setLastTicket] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    employee_name: "",
    employee_email: "",
    department: "Engineering",
    description: "",
  });

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE_URL);
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle Request Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLastTicket(null);

    try {
      const res = await axios.post(API_BASE_URL, formData);
      if (res.data.success) {
        setLastTicket(res.data.data);
        setFormData({
          employee_name: "",
          employee_email: "",
          department: "Engineering",
          description: "",
        });
        fetchRequests(); // Refresh table
      }
    } catch (err) {
      alert("Submission failed. Check backend/n8n connection.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Lifecycle Status Update
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/${ticketId}`, { status: newStatus });
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredRequests = activeTab === "all" 
    ? requests 
    : requests.filter((r) => r.status === activeTab);

  // Metrics Count
  const stats = {
    total: requests.length,
    open: requests.filter((r) => r.status === "Open").length,
    active: requests.filter((r) => r.status === "Active").length,
    finalized: requests.filter((r) => r.status === "Finalized").length,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="text-indigo-400 w-8 h-8" />
              Employee Request Management System
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Automated Intake, AI Triage, SLA Tracking & Lifecycle Management
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </header>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Requests</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-800/40">
            <p className="text-xs text-amber-400 uppercase font-semibold">Open Tickets</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{stats.open}</p>
          </div>
          <div className="bg-blue-950/20 p-4 rounded-xl border border-blue-800/40">
            <p className="text-xs text-blue-400 uppercase font-semibold">In Progress (Active)</p>
            <p className="text-2xl font-bold text-blue-300 mt-1">{stats.active}</p>
          </div>
          <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-800/40">
            <p className="text-xs text-emerald-400 uppercase font-semibold">Finalized</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{stats.finalized}</p>
          </div>
        </div>

        {/* Main Grid: Form + Tickets Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Request Intake Form */}
          <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 h-fit">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              Submit Request
            </h2>

            {lastTicket && (
              <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-600/40 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Request Created!
                </p>
                <p className="text-slate-300">Ticket: <span className="font-mono text-white">{lastTicket.ticket_id}</span></p>
                <p className="text-slate-300">Category: <span className="text-indigo-300">{lastTicket.category}</span></p>
                <p className="text-slate-300">SLA: <span className="text-amber-300">{lastTicket.sla_hours} hrs</span></p>
               <p className="text-[11px] text-emerald-300/90 pt-1 flex items-center gap-1">
      ✉️ Confirmation email sent to your inbox.
    </p>
                
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">Employee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subhakar Maurya"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">Employee Email</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  value={formData.employee_email}
                  onChange={(e) => setFormData({ ...formData, employee_email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">Department</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">Issue Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain your problem (e.g. My salary for this month has not been credited)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI Classifying & Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tickets Dashboard Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {["all", "Open", "Active", "Finalized"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition ${
                      activeTab === tab
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400">{filteredRequests.length} tickets</span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-700/60 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Ticket</th>
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Category / Priority</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-slate-500">
                        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id || req.ticket_id} className="hover:bg-slate-800/90 transition">
                        <td className="p-3.5 font-mono text-indigo-300 font-medium">
                          {req.ticket_id}
                        </td>
                        <td className="p-3.5">
                          <p className="font-medium text-white">{req.employee_name}</p>
                          <p className="text-[11px] text-slate-400">{req.department}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-[11px] font-medium mr-1.5">
                            {req.category || "General"}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            req.priority === "Critical" ? "bg-rose-900/40 text-rose-300 border border-rose-700/50" :
                            req.priority === "High" ? "bg-orange-900/40 text-orange-300" :
                            req.priority === "Medium" ? "bg-amber-900/40 text-amber-300" :
                            "bg-slate-700 text-slate-300"
                          }`}>
                            {req.priority || "Medium"}
                          </span>
                        </td>
                        <td className="p-3.5 max-w-[200px] truncate text-slate-300" title={req.description}>
                          {req.description}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            req.status === "Finalized" ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700/50" :
                            req.status === "Active" ? "bg-blue-900/50 text-blue-300 border border-blue-700/50" :
                            "bg-amber-900/50 text-amber-300 border border-amber-700/50"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={req.status}
                            onChange={(e) => handleStatusChange(req.ticket_id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Open">Open</option>
                            <option value="Active">Active</option>
                            <option value="Finalized">Finalized</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}