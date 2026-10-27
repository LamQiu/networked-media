const manifestoButtonSize = {
  width: 20,
  height: 12,
};

const bottomStepRow = {
  count: 6,
  gap: 12,
  say: "move right to manifesto",
};

const manifestoStepColumn = {
  count: 4,
  gap: 12,
  say: "move down to manifesto",
};

const manifestoText =
  "Memory does not live only in images or words. Sometimes, a sound can bring an entire world back to life. As Proust writes, the smell and taste of things remain poised a long time, like souls. Perhaps our sounds, gathered together, can become a memory that belongs to no one and everyone.";

const month = document.body.dataset.month;
const days = document.querySelectorAll(".day");
const form = document.querySelector("#upload-form");
const dayInput = document.querySelector("#upload-day");
const audioInput = document.querySelector("#audio");
const manifestoButton = document.querySelector("#manifesto-button");
const filesByDay = JSON.parse(document.querySelector("#files-by-day").textContent);

const monthNames = {
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  oct: "October",
  nov: "November",
  dec: "December",
};

let hoverPreviewDay = null;
let previewPlayers = [];
let audioUnlocked = false;
const unlockAudioEl = new Audio();
let manifestoPauseTimer = null;

function femaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => /en(-|$)/i.test(voice.lang) && /female|samantha|karen|moira|tessa|fiona|victoria|zira|susan|linda|hazel|google uk english female|google us english/i.test(voice.name))
    || voices.find((voice) => /en(-|$)/i.test(voice.lang) && !/male|david|daniel|fred|alex|tom|george|rishi/i.test(voice.name))
    || voices.find((voice) => /^en(-|$)/i.test(voice.lang))
    || voices[0]
  );
}

function stopSpeak() {
  if (manifestoPauseTimer !== null) {
    clearTimeout(manifestoPauseTimer);
    manifestoPauseTimer = null;
  }
  if (!window.speechSynthesis) {
    return;
  }
  window.speechSynthesis.cancel();
}

function speak(text) {
  if (!window.speechSynthesis || !text) {
    return;
  }
  stopSpeak();
  const utterance = new SpeechSynthesisUtterance(String(text));
  const voice = femaleVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

function onHoverSpeak(element, text) {
  element.addEventListener("pointerenter", () => speak(text));
  element.addEventListener("pointerleave", stopSpeak);
}

function speakManifesto() {
  stopSpeak();
  const title = speak("Manifesto");
  if (!title) {
    return;
  }
  title.onend = () => {
    manifestoPauseTimer = setTimeout(() => {
      manifestoPauseTimer = null;
      const body = new SpeechSynthesisUtterance(manifestoText);
      const voice = femaleVoice();
      if (voice) {
        body.voice = voice;
      }
      body.pitch = 1;
      body.rate = 1;
      body.volume = 1;
      window.speechSynthesis.speak(body);
    }, 450);
  };
}

window.speechSynthesis.getVoices();
window.speechSynthesis.addEventListener("voiceschanged", femaleVoice);

function dayFiles(day) {
  return filesByDay[String(day)] || [];
}

function clearDots() {
  document.querySelectorAll(".file-dots").forEach((dots) => dots.remove());
}

function renderDots() {
  clearDots();
  days.forEach((day) => {
    const files = dayFiles(day.dataset.day);
    if (files.length === 0) {
      return;
    }
    const dots = document.createElement("span");
    dots.className = "file-dots";
    files.forEach(() => {
      const dot = document.createElement("span");
      dot.className = "file-dot";
      dots.append(dot);
    });
    day.append(dots);
  });
}

function unlockAudio() {
  if (audioUnlocked) {
    return Promise.resolve();
  }
  unlockAudioEl.muted = true;
  return unlockAudioEl.play().then(() => {
    unlockAudioEl.pause();
    unlockAudioEl.currentTime = 0;
    unlockAudioEl.muted = false;
    audioUnlocked = true;
  }).catch(() => {
    unlockAudioEl.muted = false;
  });
}

function stopHoverPreview() {
  hoverPreviewDay = null;
  previewPlayers.forEach((player) => {
    player.pause();
    player.removeAttribute("src");
    player.load();
  });
  previewPlayers = [];
}

function startHoverPreview(day) {
  const files = dayFiles(day);
  if (files.length === 0) {
    return;
  }
  stopSpeak();
  stopHoverPreview();
  hoverPreviewDay = day;

  files.forEach((_, index) => {
    const player = new Audio(`audio/${month}/${day}/${index}`);
    player.loop = true;
    player.muted = false;
    previewPlayers.push(player);
    const play = () => {
      if (hoverPreviewDay !== day) {
        return;
      }
      player.play().then(() => {
        audioUnlocked = true;
      }).catch(() => {});
    };
    if (player.readyState >= 2) {
      play();
    } else {
      player.addEventListener("canplay", play, { once: true });
      player.load();
    }
  });
}

function applyManifestoButtonSize() {
  document.documentElement.style.setProperty("--manifesto-w", `${manifestoButtonSize.width}vw`);
  document.documentElement.style.setProperty("--manifesto-h", `${manifestoButtonSize.height}vh`);
  if (!manifestoButton) {
    return;
  }
  manifestoButton.style.width = `${manifestoButtonSize.width}vw`;
  manifestoButton.style.height = `${manifestoButtonSize.height}vh`;
}

function buildStepPath() {
  const path = document.querySelector("#step-path");
  if (!path) {
    return;
  }
  path.replaceChildren();

  const row = document.createElement("div");
  row.className = "bottom-step-row";
  row.style.right = `calc(24px + ${manifestoButtonSize.width}vw + ${bottomStepRow.gap}px)`;
  row.style.height = `${manifestoButtonSize.height}vh`;
  row.style.gap = `${bottomStepRow.gap}px`;
  for (let i = 0; i < bottomStepRow.count; i += 1) {
    const el = document.createElement("div");
    el.className = "step-stone step-stone-row";
    el.setAttribute("aria-label", bottomStepRow.say);
    onHoverSpeak(el, bottomStepRow.say);
    row.append(el);
  }
  path.append(row);

  const column = document.createElement("div");
  column.className = "upload-step-column";
  column.style.right = "24px";
  column.style.bottom = `calc(24px + ${manifestoButtonSize.height}vh + ${manifestoStepColumn.gap}px)`;
  column.style.width = `${manifestoButtonSize.width}vw`;
  column.style.gap = `${manifestoStepColumn.gap}px`;
  for (let i = 0; i < manifestoStepColumn.count; i += 1) {
    const el = document.createElement("div");
    el.className = "step-stone step-stone-column";
    el.setAttribute("aria-label", manifestoStepColumn.say);
    onHoverSpeak(el, manifestoStepColumn.say);
    column.append(el);
  }
  path.append(column);
}

days.forEach((day) => {
  day.addEventListener("pointerdown", () => {
    unlockAudio();
  });
  day.addEventListener("pointerenter", () => {
    if (dayFiles(day.dataset.day).length > 0) {
      startHoverPreview(day.dataset.day);
      return;
    }
    speak(`day ${day.dataset.day}, ${monthNames[month] || month}, click to upload`);
  });
  day.addEventListener("pointerleave", () => {
    stopSpeak();
    if (hoverPreviewDay === day.dataset.day) {
      stopHoverPreview();
    }
  });
  day.addEventListener("click", () => {
    unlockAudio();
    stopHoverPreview();
    dayInput.value = day.dataset.day;
    audioInput.value = "";
    audioInput.click();
  });
});

audioInput.addEventListener("change", async () => {
  if (audioInput.files.length === 0 || !dayInput.value) {
    return;
  }

  const day = dayInput.value;
  const file = audioInput.files[0];

  const objectUrl = URL.createObjectURL(file);
  unlockAudioEl.src = objectUrl;
  unlockAudioEl.muted = false;
  try {
    await unlockAudioEl.play();
    unlockAudioEl.pause();
    unlockAudioEl.currentTime = 0;
    audioUnlocked = true;
  } catch (_) {}
  URL.revokeObjectURL(objectUrl);
  stopHoverPreview();

  const body = new FormData(form);
  try {
    await fetch(form.action, { method: "POST", body, redirect: "follow" });
    if (!filesByDay[day]) {
      filesByDay[day] = [];
    }
    filesByDay[day].push({ name: file.name });
    renderDots();
  } catch (_) {}
});

manifestoButton.addEventListener("pointerenter", () => {
  stopHoverPreview();
  speakManifesto();
});
manifestoButton.addEventListener("pointerleave", stopSpeak);

applyManifestoButtonSize();
buildStepPath();
window.addEventListener("resize", buildStepPath);
renderDots();
