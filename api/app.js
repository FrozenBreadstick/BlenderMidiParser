const fs = require("fs");
const { Midi } = require("@tonejs/midi");
const express = require("express");
const cors = require("cors");
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

const filterType = function (req, file, cb) {
  const allowedTypes = ["audio/midi", "audio/mid", "audio/x-midi"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only MIDI files are allowed!"), false);
  }
};

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: filterType,
});

app.get("/", (req, res) => {
  try {
    const [fileName] = fs.readdirSync("./uploads");

    if (!fileName) {
      return res.status(404).json({ error: "Folder is empty" });
    }

    const buffer = fs.readFileSync(`./uploads/${fileName}`);

    res.json({
      filename: fileName,
      midi: new Midi(buffer),
    });
  } catch (err) {
    res.status(500).json({ error: "Could not read file" });
  }
});

app.post("/upload", upload.single("midi"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const midiData = new Midi(fs.readFileSync(req.file.path));

  res.json({
    message: "File uploaded successfully",
    midi: midiData,
  });
});

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
