const imageLoader = document.getElementById('imageLoader');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetSelection');
const startGameBtn = document.getElementById('startGame');
const mainArea = document.getElementById('mainArea');

let img = new Image();
let imgLoaded = false;

let startX, startY, endX, endY;
let dragging = false;
let selection = null;

function drawImageAndSelection() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(!imgLoaded) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const imgRatio = img.width / img.height;
  const canvasRatio = cw / ch;

  let drawWidth, drawHeight, offsetX, offsetY;
  if(imgRatio > canvasRatio){
    drawWidth = cw;
    drawHeight = cw / imgRatio;
    offsetX = 0;
    offsetY = (ch - drawHeight) / 2;
  } else {
    drawHeight = ch;
    drawWidth = ch * imgRatio;
    offsetX = (cw - drawWidth) / 2;
    offsetY = 0;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  if(selection) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
    ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
  }
}

function getPointerPos(evt){
  const rect = canvas.getBoundingClientRect();
  let x, y;
  if(evt.touches){
    x = evt.touches[0].clientX - rect.left;
    y = evt.touches[0].clientY - rect.top;
  } else {
    x = evt.clientX - rect.left;
    y = evt.clientY - rect.top;
  }
  return {x, y};
}

function clamp(value, min, max){
  return Math.min(Math.max(value, min), max);
}

canvas.addEventListener('mousedown', (e) => {
  if(!imgLoaded) return;
  dragging = true;
  let pos = getPointerPos(e);
  startX = clamp(pos.x, 0, canvas.width);
  startY = clamp(pos.y, 0, canvas.height);
  selection = null;
  drawImageAndSelection();
});
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  canvas.dispatchEvent(new MouseEvent('mousedown', e));
});

canvas.addEventListener('mousemove', (e) => {
  if(!dragging) return;
  let pos = getPointerPos(e);
  endX = clamp(pos.x, 0, canvas.width);
  endY = clamp(pos.y, 0, canvas.height);

  let x = Math.min(startX, endX);
  let y = Math.min(startY, endY);
  let w = Math.abs(endX - startX);
  let h = Math.abs(endY - startY);

  selection = {x, y, w, h};
  drawImageAndSelection();
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  canvas.dispatchEvent(new MouseEvent('mousemove', e));
});

canvas.addEventListener('mouseup', (e) => {
  if(!dragging) return;
  dragging = false;
  if(selection && (selection.w < 5 || selection.h < 5)) {
    selection = null;
  }
  drawImageAndSelection();
  startGameBtn.disabled = !selection;
});
canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  canvas.dispatchEvent(new MouseEvent('mouseup', e));
});

imageLoader.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      imgLoaded = true;
      selection = null;
      startGameBtn.disabled = true;
      drawImageAndSelection();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

resetBtn.addEventListener('click', () => {
  selection = null;
  startGameBtn.disabled = true;
  drawImageAndSelection();
});

startGameBtn.addEventListener('click', () => {
  if(!selection) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const imgRatio = img.width / img.height;
  const canvasRatio = cw / ch;

  let drawWidth, drawHeight, offsetX, offsetY;
  if(imgRatio > canvasRatio){
    drawWidth = cw;
    drawHeight = cw / imgRatio;
    offsetX = 0;
    offsetY = (ch - drawHeight) / 2;
  } else {
    drawHeight = ch;
    drawWidth = ch * imgRatio;
    offsetX = (cw - drawWidth) / 2;
    offsetY = 0;
  }

  let sx = (selection.x - offsetX) * (img.width / drawWidth);
  let sy = (selection.y - offsetY) * (img.height / drawHeight);
  let sw = selection.w * (img.width / drawWidth);
  let sh = selection.h * (img.height / drawHeight);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = sw;
  tempCanvas.height = sh;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const croppedDataUrl = tempCanvas.toDataURL();

  startGame(croppedDataUrl);
});

// --- ゲーム処理部分 ---

function startGame(faceDataUrl) {
  // UIクリア
  mainArea.innerHTML = '';

  // ゲームcanvas作成
  const gameCanvas = document.createElement('canvas');
  gameCanvas.width = 480;
  gameCanvas.height = 320;
  mainArea.appendChild(gameCanvas);
  const gctx = gameCanvas.getContext('2d');

  const faceImg = new Image();
  faceImg.src = faceDataUrl;

  const player = {
    x: 50,
    y: 0,
    width: 50,
    height: 50,
    vy: 0,
    onGround: false,
  };

  const gravity = 0.8;
  const groundY = 280;

  let keys = {};

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  gameCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if(player.onGround){
      player.vy = -15;
      player.onGround = false;
    }
  });

  function gameLoop() {
    gctx.fillStyle = '#87ceeb';
    gctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    gctx.fillStyle = '#654321';
    gctx.fillRect(0, groundY, gameCanvas.width, gameCanvas.height - groundY);

    player.vy += gravity;
    player.y += player.vy;

    if(player.y + player.height >= groundY){
      player.y = groundY - player.height;
      player.vy = 0;
      player.onGround = true;
    }

    if(keys['Space'] && player.onGround){
      player.vy = -15;
      player.onGround = false;
    }

    if(faceImg.complete){
      gctx.drawImage(faceImg, player.x, player.y, player.width, player.height);
    } else {
      gctx.fillStyle = 'red';
      gctx.fillRect(player.x, player.y, player.width, player.height);
    }

    requestAnimationFrame(gameLoop);
  }

  faceImg.onload = () => {
    gameLoop();
  };
}
