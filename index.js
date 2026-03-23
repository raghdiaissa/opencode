const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// اختبار السيرفر
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// API تشغيل opencode
app.post("/run", (req, res) => {
  let prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  // حماية بسيطة
  prompt = prompt.replace(/[^a-zA-Z0-9 \u0600-\u06FF]/g, "");

  exec(`npx opencode "${prompt}"`, (error, stdout, stderr) => {
    if (error) {
      return res.json({ error: error.message });
    }

    if (stderr) {
      return res.json({ error: stderr });
    }

    res.json({ output: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
