const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors({
origin: "https://vissionzz.github.io"
}));

app.use(express.json());

app.get("/", (req, res) => {
res.send("JARVIS AI backend is online.");
});

app.post("/api/chat", async (req, res) => {
try {
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  return res.status(500).json({
    error: "OPENAI_API_KEY is missing from Render Environment."
  });
}

const { message } = req.body;

if (!message || typeof message !== "string") {
  return res.status(400).json({
    error: "Please send a message."
  });
}

const client = new OpenAI({ apiKey });

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: "You are JARVIS, a helpful and intelligent personal AI assistant. Speak clearly, confidently, and naturally. Keep spoken answers concise."
    },
    {
      role: "user",
      content: message
    }
  ]
});

res.json({
  reply: response.choices[0].message.content
});

} catch (error) {
console.error("JARVIS error:", error.message);

res.status(500).json({
  error: "JARVIS encountered an AI server error. Check the Render logs and API billing."
});

}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
console.log("JARVIS AI running on port ${PORT}");
});
