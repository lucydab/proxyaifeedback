import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Endpoint for AI feedback
app.post("/ai-feedback", async (req, res) => {
  try {
    const { lessonPlanData, learnerId } = req.body;

    // Log submission to console
    console.log("Received submission from:", learnerId || "unknown learner");
    console.log(lessonPlanData);

    // Append submission to a JSON file
    const logEntry = {
      learnerId: learnerId || null,
      lessonPlanData,
      timestamp: new Date().toISOString()
    };
    fs.appendFileSync("submissions.json", JSON.stringify(logEntry) + "\n");

    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are an expert ESL teacher and instructional designer. Evaluate the learner's inductive grammar lesson plan. 
Provide concise, actionable, supportive feedback (8–12 sentences) covering:
- Grammar Topic
- Sentence Examples (in context)
- Guiding Questions
- Sentence Frame
- Direct Instruction / Rule
- Practice Activity
            `
          },
          { role: "user", content: lessonPlanData }
        ]
      })
    });

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    res.json({ feedback });

  } catch (err) {
    console.error(err);
    res.status(500).json({ feedback: "Error generating AI feedback." });
  }
});

// Optional: health check
app.get("/health", (req, res) => {
  res.send("Server is awake!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

