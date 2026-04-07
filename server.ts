import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import { Complaint, Issue, SprintTask } from "./src/models/index.ts";
import { runAnalysisPipeline } from "./src/services/gemini.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // MongoDB Connection
  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/complaint_intelligence";
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  app.use(cors());
  app.use(express.json());

  // API Routes

  // POST /api/complaints -> Save complaints
  app.post("/api/complaints", async (req, res) => {
    try {
      const { complaints } = req.body; // Array of strings or objects
      if (!Array.isArray(complaints)) {
        return res.status(400).json({ error: "Complaints must be an array" });
      }

      const savedComplaints = await Complaint.insertMany(
        complaints.map((c: any) => ({
          text: typeof c === "string" ? c : c.text,
          source:
            typeof c === "string" ? "user_input" : c.source || "user_input",
        })),
      );

      res.status(201).json(savedComplaints);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST /api/analyze -> Run full prompt pipeline
  app.post("/api/analyze", async (req, res) => {
    try {
      const { complaints } = req.body;
      if (!Array.isArray(complaints) || complaints.length === 0) {
        return res
          .status(400)
          .json({ error: "No complaints provided for analysis" });
      }

      const analysisResults = await runAnalysisPipeline(complaints);

      // Store results
      // Clear previous analysis for this run? Or just add?
      // Usually, we want to see the latest analysis.

      const savedIssues = [];
      for (const item of analysisResults) {
        const issue = new Issue({
          issue: item.issue,
          category: item.category,
          sentiment: item.sentiment,
          severity: item.severity,
          frequency: item.frequency,
          priorityScore: item.priorityScore,
          priorityLevel: item.priorityLevel,
          label: item.label,
        });
        await issue.save();
        savedIssues.push(issue);

        const sprintTask = new SprintTask({
          userStory: item.sprintTask.userStory,
          acceptanceCriteria: item.sprintTask.acceptanceCriteria,
          storyPoints: item.sprintTask.storyPoints,
          issueId: issue._id,
        });
        await sprintTask.save();
      }

      res.json({ message: "Analysis complete", issues: savedIssues });
    } catch (err) {
      console.error("Analysis error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // GET /api/issues -> Fetch analyzed issues
  app.get("/api/issues", async (req, res) => {
    try {
      const issues = await Issue.find().sort({ createdAt: -1 });
      res.json(issues);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // GET /api/sprint -> Fetch sprint-ready tasks
  app.get("/api/sprint", async (req, res) => {
    try {
      const tasks = await SprintTask.find()
        .populate("issueId")
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
