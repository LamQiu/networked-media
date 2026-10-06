const easings = {
    linear: t => t,
    easeIn: t => t * t * t,
    easeOut: t => 1 - Math.pow(1 - t, 3),
    easeInOut: t => t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutBack: t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
};

const clamp01 = v => Math.min(Math.max(v, 0), 1);

function animateRing(ctx, {
    x = ctx.canvas.width / 2,
    y = ctx.canvas.height / 2,
    radius = 180,
    lineWidth = 50,
    color = "white",
    duration = 0.75,
    offsetDuration = 0.75,
    ease = easings.easeInOut,
    offsetEase = easings.easeInOut,
} = {}) {
    const half = radius + lineWidth / 2 + 1;
    const startTime = Date.now();
    let timer = null;

    function draw(progress, offset) {
        ctx.clearRect(x - half, y - half, half * 2, half * 2);

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.arc(
            x,
            y,
            radius,
            -Math.PI / 2 + offset,
            -Math.PI / 2 + Math.PI * 2 * progress
        );
        ctx.stroke();
    }

    function update() {
        const elapsed = (Date.now() - startTime) / 1000;

        const t1 = Math.min(elapsed / duration, 1);
        const t2 = Math.min(Math.max(elapsed - duration, 0) / offsetDuration, 1);

        const progress = clamp01(ease(t1));
        const offset = Math.PI * 2 * clamp01(offsetEase(t2));

        draw(progress, offset);

        if (t2 >= 1) {
            clearInterval(timer);
        }
    }

    timer = setInterval(update, 16);
    return timer;
}

function moveBall(ball, {
    angle = Math.PI / 4,
    speed = 200,
    obstacles = [],
    onCollide = () => { },
} = {}) {
    const r = ball.offsetWidth / 2;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    let lastTime = Date.now();

    function collideWithCircle(el) {
        const rect = el.getBoundingClientRect();
        const R = rect.width / 2;
        const cx = rect.left + R;
        const cy = rect.top + R;

        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist === 0 || dist >= R + r) return;

        const nx = dx / dist;
        const ny = dy / dist;

        x = cx + nx * (R + r);
        y = cy + ny * (R + r);

        // Only bounce while moving toward the circle, so one hit fires onCollide exactly once.
        const dot = vx * nx + vy * ny;
        if (dot < 0) {
            vx -= 2 * dot * nx;
            vy -= 2 * dot * ny;
            onCollide(el);
        }
    }

    function update() {
        const now = Date.now();
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        x += vx * dt;
        y += vy * dt;

        obstacles.forEach(collideWithCircle);

        if (x < r) { x = r; vx = Math.abs(vx); }
        if (x > window.innerWidth - r) { x = window.innerWidth - r; vx = -Math.abs(vx); }
        if (y < r) { y = r; vy = Math.abs(vy); }
        if (y > window.innerHeight - r) { y = window.innerHeight - r; vy = -Math.abs(vy); }

        ball.style.left = x + "px";
        ball.style.top = y + "px";
    }

    return setInterval(update, 16);
}

window.addEventListener('load', () => {
    const circle = document.querySelector(".circle");
    const ball = document.querySelector(".ball");
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let ringTimer = null;

    function playRing() {
        const rect = circle.getBoundingClientRect();
        clearInterval(ringTimer);
        ringTimer = animateRing(ctx, {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            radius: rect.width / 2 + 20,
            lineWidth: 20,
        });
    }

    circle.addEventListener('click', playRing);

    moveBall(ball, {
        obstacles: [circle],
        onCollide: playRing,
    });
});

// ===== Camera slit-scan =====

async function startCamera() {
    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = true;

    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
    });
    video.srcObject = stream;
    await video.play();

    return video;
}

function drawVideoCover(ctx, video, {
    mirror = true,
    cw = ctx.canvas.width,
    ch = ctx.canvas.height,
} = {}) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const scale = Math.max(cw / vw, ch / vh);
    const w = vw * scale;
    const h = vh * scale;

    ctx.save();
    if (mirror) {
        ctx.translate(cw, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(video, (cw - w) / 2, (ch - h) / 2, w, h);
    ctx.restore();
}

// Snapshots the slice that will sit at screen position (x, y) into sliceCtx (a canvas exactly one slice in size),
// so its content is fixed up front and can be revealed gradually.
// "scan" copies the camera pixels that sit at the same x; "center" always copies the middle column.
// With probability stretchThreshold, the slice is replaced by its leftmost pixel column repeated across its width.
function captureSlice(sliceCtx, video, x, y, screenWidth, screenHeight, { source = "scan", stretchThreshold = 0 } = {}) {
    const width = sliceCtx.canvas.width;
    const h = sliceCtx.canvas.height;

    sliceCtx.save();
    const sourceX = source === "center" ? screenWidth / 2 - width / 2 : x;
    sliceCtx.translate(-sourceX, -y);
    drawVideoCover(sliceCtx, video, { cw: screenWidth, ch: screenHeight });
    sliceCtx.restore();

    if (Math.random() < stretchThreshold) {
        sliceCtx.save();
        // Without this, smoothing blends in neighbouring columns instead of repeating one exactly.
        sliceCtx.imageSmoothingEnabled = false;
        sliceCtx.drawImage(sliceCtx.canvas, 0, 0, 1, h, 0, 0, width, h);
        sliceCtx.restore();
    }
}

window.addEventListener('load', async () => {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    const minSliceWidth = 128;
    const maxSliceWidth = 256;
    const step = 4;
    const stretchThreshold = 0.5;
    const laneCount = 512;

    let lanes = [];

    function randomSliceWidth() {
        return Math.floor(minSliceWidth + Math.random() * (maxSliceWidth - minSliceWidth + 1));
    }

    function createLanes() {
        lanes = [];
        for (let i = 0; i < laneCount; i++) {
            const y = Math.round(i * canvas.height / laneCount);
            const nextY = Math.round((i + 1) * canvas.height / laneCount);

            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.height = nextY - y;

            lanes.push({
                y,
                height: nextY - y,
                sliceCanvas,
                sliceCtx: sliceCanvas.getContext("2d"),
                scanX: 0,
                sliceWidth: 0,
                revealed: 0,
                sliceReady: false,
            });
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        createLanes();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let video = null;
    try {
        video = await startCamera();
    } catch (err) {
        console.error("Could not start camera:", err);
    }

    function updateLane(lane) {
        if (!lane.sliceReady) {
            lane.sliceWidth = randomSliceWidth();
            lane.sliceCanvas.width = lane.sliceWidth;
            captureSlice(
                lane.sliceCtx, video,
                lane.scanX, lane.y,
                canvas.width, canvas.height,
                { stretchThreshold }
            );
            lane.sliceReady = true;
            lane.revealed = 0;
        }

        const w = Math.min(step, lane.sliceWidth - lane.revealed);
        ctx.drawImage(
            lane.sliceCanvas,
            lane.revealed, 0, w, lane.height,
            lane.scanX + lane.revealed, lane.y, w, lane.height
        );
        lane.revealed += w;

        if (lane.revealed >= lane.sliceWidth) {
            lane.sliceReady = false;
            lane.scanX += lane.sliceWidth;
            if (lane.scanX >= canvas.width) {
                lane.scanX = 0;
            }
        }
    }

    function update() {
        if (!video || video.readyState < video.HAVE_CURRENT_DATA) return;

        lanes.forEach(updateLane);
    }

    setInterval(update, 16);
});
