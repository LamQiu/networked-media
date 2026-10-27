const express = require("express");
const nunjucks = require("nunjucks");
const multer = require("multer");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  noCache: true,
});
app.set("view engine", "njk");

const months = [
  { key: "jan", label: "jan.", days: 31 },
  { key: "feb", label: "feb.", days: 28 },
  { key: "mar", label: "mar.", days: 31 },
  { key: "apr", label: "apr.", days: 30 },
  { key: "may", label: "may.", days: 31 },
  { key: "jun", label: "jun.", days: 30 },
  { key: "jul", label: "jul.", days: 31 },
  { key: "aug", label: "aug.", days: 31 },
  { key: "sep", label: "sep.", days: 30 },
  { key: "oct", label: "oct.", days: 31 },
  { key: "nov", label: "nov.", days: 30 },
  { key: "dec", label: "dec.", days: 31 },
];

const monthByKey = Object.fromEntries(months.map((month) => [month.key, month]));

let allData = {};

function isAudio(file) {
  const name = file.originalname.toLowerCase();
  return name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".m4a");
}

function monthFrom() {
  return monthByKey.oct;
}

function selectedDayFrom(value, month) {
  const day = Number(value);
  if (!Number.isInteger(day) || day < 1 || day > month.days) {
    return undefined;
  }
  return day;
}

function monthData(monthKey) {
  if (!allData[monthKey]) {
    allData[monthKey] = {};
  }
  return allData[monthKey];
}

function dayFiles(monthKey, day) {
  const files = (allData[monthKey] || {})[String(day)];
  return Array.isArray(files) ? files : [];
}

function fileNamesByDay(monthKey) {
  const names = {};
  const data = allData[monthKey] || {};
  for (const day of Object.keys(data)) {
    const files = dayFiles(monthKey, day);
    if (files.length > 0) {
      names[day] = files.map((file) => ({ name: file.originalname }));
    }
  }
  return names;
}

function scriptJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function audioType(file) {
  if (file.mimetype && file.mimetype.startsWith("audio/")) {
    return file.mimetype;
  }
  const name = file.originalname.toLowerCase();
  if (name.endsWith(".mp3")) {
    return "audio/mpeg";
  }
  if (name.endsWith(".wav")) {
    return "audio/wav";
  }
  if (name.endsWith(".m4a")) {
    return "audio/mp4";
  }
  return "application/octet-stream";
}

function renderCalendar(res, month, selectedDay) {
  res.render("home.njk", {
    months,
    month,
    daysInMonth: month.days,
    selectedDay,
    filesJson: scriptJson(fileNamesByDay(month.key)),
  });
}

function calendarPath(day) {
  if (day) {
    return `/?day=${day}`;
  }
  return "/";
}

app.get("/", (req, res) => {
  const month = monthFrom();
  renderCalendar(res, month, selectedDayFrom(req.query.day, month));
});

app.get("/upload", (req, res) => {
  const month = monthFrom();
  const day = selectedDayFrom(req.query.day, month);
  res.redirect(calendarPath(day));
});

app.get("/audio/:month/:day/:index", (req, res) => {
  const month = monthFrom();
  const day = Number(req.params.day);
  const index = Number(req.params.index);
  const files = dayFiles(month.key, day);
  const file = files[index];
  if (!Number.isInteger(day) || day < 1 || day > month.days || !Number.isInteger(index) || index < 0 || !file) {
    res.status(404).end();
    return;
  }

  const body = file.buffer;
  const total = body.length;
  res.set("Accept-Ranges", "bytes");
  res.type(audioType(file));

  const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || "");
  if (!match) {
    res.set("Content-Length", String(total));
    res.send(body);
    return;
  }

  const start = Number(match[1]);
  const end = match[2] === "" ? total - 1 : Math.min(Number(match[2]), total - 1);
  if (start > end || start >= total) {
    res.status(416).set("Content-Range", `bytes */${total}`).end();
    return;
  }

  const chunk = body.subarray(start, end + 1);
  res.status(206);
  res.set("Content-Range", `bytes ${start}-${end}/${total}`);
  res.set("Content-Length", String(chunk.length));
  res.send(chunk);
});

app.post("/upload", (req, res) => {
  upload.single("audio")(req, res, (err) => {
    const month = monthFrom();
    const day = Number(req.body && req.body.day);
    const validDay = Number.isInteger(day) && day >= 1 && day <= month.days;

    if (!err && validDay && req.file && isAudio(req.file)) {
      const data = monthData(month.key);
      const key = String(day);
      if (!Array.isArray(data[key])) {
        data[key] = [];
      }
      data[key].push(req.file);
    }

    res.redirect(calendarPath(validDay ? day : undefined));
  });
});

app.listen(process.env.PORT || 3000);
