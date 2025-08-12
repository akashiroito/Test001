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
let emptyIndex = rows * cols - 1;
let selectedIndex = null; // 選択中ピースのindex

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
  selectedIndex = null;
}

function drawPuzzle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let i=0; i<pieces.length; i++) {
    let pieceNum = pieces[i];
    if(pieceNum === emptyIndex) continue; // 空ピースは描かない

    let sx = (pieceNum % cols) * imgPieceWidth;
    let sy = Math.floor(pieceNum / cols) * imgPieceHeight;
    let dx = (i % cols) * pieceWidth;
    let dy = Math.floor(i / cols) * pieceHeight;

    ctx.drawImage(img, sx, sy, imgPieceWidth, imgPieceHeight, dx, dy, pieceWidth, pieceHeight);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(dx, dy, pieceWidth, pieceHeight);

    if(i === selectedIndex) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.strokeRect(dx + 2, dy + 2, pieceWidth - 4, pieceHeight -4);
    }
  }
}

// 画像の元ピースサイズ（元画像を分割する際の１ピースの幅・高さ）
let imgPieceWidth, imgPieceHeight;

// アップロード画像の表示位置・サイズ調整用
let imgDrawX, imgDrawY, imgDrawWidth, imgDrawHeight;

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
  let n = pieces.length - 1;
  for(let i=n; i>0; i--) {
    let j = Math.floor(Math.random() * (i));
    if(j === emptyIndex) j = i - 1;
    swapPieces(i, j);
  }
  if(isSolved()) shufflePuzzle();
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
  if(clickX < 0 || clickX > canvas.width || clickY < 0 || clickY > canvas.height) return null;
  const col = Math.floor(clickX / pieceWidth);
  const row = Math.floor(clickY / pieceHeight);
  return row * cols + col;
}

canvas.addEventListener('click', (e) => {
  if(!img.src) return;
  const index = getClickedPiece(e.clientX, e.clientY);
  if(index === null) return;

  if(index === emptyIndex) {
    // 空ピースクリック
    if(selectedIndex !== null && canSwap(selectedIndex)) {
      // 選択中ピースが空ピース隣接ならスワップ
      swapPieces(selectedIndex, emptyIndex);
      emptyIndex = selectedIndex;
      selectedIndex = null;
      drawPuzzle();
      if(isSolved()) showMessage('完成！おめでとうございます！');
    } else {
      // 隣接してなければ無視
      // メッセージは出さない
    }
  } else {
    // 空ピース以外クリック
    if(selectedIndex === index) {
      // 同じピースなら選択解除
      selectedIndex = null;
    } else {
      // 新しく選択
      selectedIndex = index;
    }
    drawPuzzle();
  }
});

imageLoader.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      // canvasサイズ固定300x300
      const canvasSize = 300;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      // 画像のアスペクト比を保持してcanvas内に最大表示
      const imgW = img.width;
      const imgH = img.height;
      const imgRatio = imgW / imgH;
      const canvasRatio = canvas.width / canvas.height;

      if(imgRatio > canvasRatio) {
        // 横長画像
        imgDrawWidth = canvas.width;
        imgDrawHeight = canvas.width / imgRatio;
        imgDrawX = 0;
        imgDrawY = (canvas.height - imgDrawHeight) / 2;
      } else {
        // 縦長画像または正方形
        imgDrawHeight = canvas.height;
        imgDrawWidth = canvas.height * imgRatio;
        imgDrawY = 0;
        imgDrawX = (canvas.width - imgDrawWidth) / 2;
      }

      pieceWidth = canvas.width / cols;
      pieceHeight = canvas.height / rows;

      // 元画像のピース幅高さ
      imgPieceWidth = img.width / cols;
      imgPieceHeight = img.height / rows;

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
