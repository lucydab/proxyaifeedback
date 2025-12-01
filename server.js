import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // key stored in Render environment

app.post("/ai-feedback", async (req, res) => {
  try {
    const { lessonPlanData } = req.body;

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
