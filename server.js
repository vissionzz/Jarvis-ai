const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
res.send("JARVIS AI backend is online.");
});

app.post("/api/chat", async (req, res) => {
try {
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  return res.status(500).json({
    error: "JARVIS AI needs an API key on its server."
  });
}

const client = new OpenAI({ apiKey });
const { message } = req.body;

if (!message || typeof message !== "string") {
  return res.status(400).json({
    error: "Please send a message."
  });
}

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: "You are JARVIS, a helpful, intelligent personal AI assistant. Speak clearly, confidently, and naturally. Keep answers concise when speaking aloud."
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
  error: "JARVIS could not process that request. Check the server configuration and API billing."
});

}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
console.log("JARVIS AI running on port ${PORT}");
});
