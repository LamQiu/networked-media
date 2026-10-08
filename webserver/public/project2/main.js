// async function startCamera() {
//     const video = document.createElement("video");
//     video.playsInline = true;
//     video.muted = true;
//
//     const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "user" },
//         audio: false,
//     });
//     video.srcObject = stream;
//     await video.play();
//
//     return video;
// }


function ensurePlays(media) {
    media.play().catch((err) => {
        console.warn(`Autoplay blocked for ${media.id}, waiting for a click / key press:`, err);
        const resume = () => {
            media.play();
            window.removeEventListener('pointerdown', resume);
            window.removeEventListener('keydown', resume);
        };
        window.addEventListener('pointerdown', resume);
        window.addEventListener('keydown', resume);
    });
}

// function drawVideoCover(ctx, video, { mirror = true } = {}) {
//     const cw = ctx.canvas.width;
//     const ch = ctx.canvas.height;
//     const vw = video.videoWidth;
//     const vh = video.videoHeight;
//
//     const scale = Math.max(cw / vw, ch / vh);
//     const w = vw * scale;
//     const h = vh * scale;
//
//     ctx.save();
//     if (mirror) {
//         ctx.translate(cw, 0);
//         ctx.scale(-1, 1);
//     }
//     ctx.drawImage(video, (cw - w) / 2, (ch - h) / 2, w, h);
//     ctx.restore();
// }

function drawVideoFullScreen(ctx, video) {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const scale = Math.max(sw / vw, sh / vh);
    const w = vw * scale;
    const h = vh * scale;

    const rect = ctx.canvas.getBoundingClientRect();
    ctx.drawImage(video, (sw - w) / 2 - rect.left, (sh - h) / 2 - rect.top, w, h);
}

window.addEventListener('load', async () => {
    ensurePlays(document.querySelector("#music"));

    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    const liveCanvas = document.querySelector("#live");
    const liveCtx = liveCanvas.getContext("2d");
    const dividerCanvas = document.querySelector("#divider");
    const dividerCtx = dividerCanvas.getContext("2d");

    const photoInterval = 500;
    // const cameraWarmup = 1000;
    const photoWidthRange = [0.05, 0.25];
    const photoHeightRange = [0.05, 0.25];
    const ballSpeed = 200;
    const ballAngle = Math.PI / 4;

    let ball = null;
    let photoW = photoWidthRange[0];
    let photoH = photoHeightRange[0];

    function randomBetween([min, max]) {
        return min + Math.random() * (max - min);
    }

    function keepBallInside() {
        const rx = canvas.width * photoW / 2;
        const ry = canvas.height * photoH / 2;

        if (ball.x < rx) { ball.x = rx; ball.vx = Math.abs(ball.vx); }
        if (ball.x > canvas.width - rx) { ball.x = canvas.width - rx; ball.vx = -Math.abs(ball.vx); }
        if (ball.y < ry) { ball.y = ry; ball.vy = Math.abs(ball.vy); }
        if (ball.y > canvas.height - ry) { ball.y = canvas.height - ry; ball.vy = -Math.abs(ball.vy); }
    }

    function resetBall() {
        ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(ballAngle) * ballSpeed,
            vy: Math.sin(ballAngle) * ballSpeed,
            lastTime: Date.now(),
        };
    }

    function updateBall() {
        const now = Date.now();
        const dt = Math.min((now - ball.lastTime) / 1000, 0.05);
        ball.lastTime = now;

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        keepBallInside();
    }

    function fitToCSS(c) {
        c.width = c.clientWidth;
        c.height = c.clientHeight;
    }

    function resizeCanvas() {
        fitToCSS(canvas);
        fitToCSS(liveCanvas);
        fitToCSS(dividerCanvas);

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        dividerCtx.fillStyle = "white";
        dividerCtx.fillRect(0, 0, dividerCanvas.width, dividerCanvas.height);

        resetBall();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // let video = null;
    // try {
    //     video = await startCamera();
    // } catch (err) {
    //     console.error("Could not start camera:", err);
    // }

    const video = document.querySelector("#smash");
    ensurePlays(video);

    function takePhoto() {
        if (video.readyState < video.HAVE_CURRENT_DATA) return;

        photoW = randomBetween(photoWidthRange);
        photoH = randomBetween(photoHeightRange);
        keepBallInside();

        const w = canvas.width * photoW;
        const h = canvas.height * photoH;
        const x = ball.x - w / 2;
        const y = ball.y - h / 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        drawVideoFullScreen(ctx, video);
        ctx.restore();
    }

    function drawLive() {
        if (video.readyState < video.HAVE_CURRENT_DATA) return;
        drawVideoFullScreen(liveCtx, video);
    }

    setInterval(drawLive, 16);

    if (video.readyState < video.HAVE_CURRENT_DATA) {
        await new Promise(resolve => video.addEventListener('loadeddata', resolve, { once: true }));
    }

    resetBall();
    takePhoto();
    setInterval(updateBall, 16);
    setInterval(takePhoto, photoInterval);
});
