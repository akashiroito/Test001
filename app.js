const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const imageLoader = document.getElementById('imageLoader');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');
const message = document.getElementById('message');

const rows = 3;
const cols = 3;
let pieces = [];
let pieceWidth, pieceHeight;
let img = new Image();
let emptyIndex = rows * cols -1;
let isDragging = false;
let dragIndex = null;

function clearMessage() {
  message.textContent = '';
}

function showMessage(text) {
  message.textContent = text;
}

function initPieces() {
  pieces = [];
  for(let i=0; i<rows*cols; i++) {
    pieces.push(i);
  }
  emptyIndex = pieces.length - 1;
}

function drawPuzzle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let i=0; i<pieces.length; i++) {
    let pieceNum = pieces[i];
    if(pieceNum === emptyIndex) continue; // 空ピースは描かない
    let sx = (pieceNum % cols) * pieceWidth;
    let sy = Math.floor(pieceNum / cols) * pieceHeight;
    let dx = (i % cols) * pieceWidth;
    let dy = Math.floor(i / cols) * pieceHeight;
    ctx.drawImage(img, sx, sy, pieceWidth, pieceHeight, dx, dy, pieceWidth, pieceHeight);
    ctx.strokeRect(dx, dy, pieceWidth, pieceHeight);
  }
}

function canSwap(index) {
  const emptyRow = Math.floor(emptyIndex / cols);
  const emptyCol = emptyIndex % cols;
  const idxRow = Math.floor(index / cols);
  const idxCol = index % cols;
  const dist = Math.abs(emptyRow - idxRow) + Math.abs(emptyCol - idxCol);
  return dist === 1;
}

function swapPieces(i1, i2) {
  [pieces[i1], pieces[i2]] = [pieces[i2], pieces[i1]];
}

function shufflePuzzle() {
  let n = pieces.length -1;
  for(let i=n; i>0; i--) {
    let j = Math.floor(Math.random() * (i));
    if(j === emptyIndex) j = i-1;
    swapPieces(i, j);
  }
  if(isSolved()) shufflePuzzle(); // 解けてたらもう一度シャッフル
  drawPuzzle();
  clearMessage();
}

function isSolved() {
  for(let i=0; i<pieces.length; i++) {
    if(pieces[i] !== i) return false;
  }
  return true;
}

function getClickedPiece(x, y) {
  const rect = canvas.getBoundingClientRect();
  const clickX = x - rect.left;
  const clickY = y - rect.top;
  const col = Math.floor(clickX / pieceWidth);
  const row = Math.floor(clickY / pieceHeight);
  return row * cols + col;
}

canvas.addEventListener('click', (e) => {
  if(!img.src) return;
  const index = getClickedPiece(e.clientX, e.clientY);
  if(canSwap(index)) {
    swapPieces(index, emptyIndex);
    emptyIndex = index;
    drawPuzzle();
    if(isSolved()) showMessage('完成！おめでとうございます！');
  }
});

imageLoader.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      // キャンバスサイズ調整（300x300固定で中央トリミング）
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      pieceWidth = size / cols;
      pieceHeight = size / rows;
      initPieces();
      drawPuzzle();
      clearMessage();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

shuffleBtn.addEventListener('click', () => {
  if(!img.src) {
    showMessage('画像を選択してください');
    return;
  }
  shufflePuzzle();
});

resetBtn.addEventListener('click', () => {
  if(!img.src) {
    showMessage('画像を選択してください');
    return;
  }
  initPieces();
  drawPuzzle();
  clearMessage();
});

// Service Worker登録（空でも必須）
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js');
}
