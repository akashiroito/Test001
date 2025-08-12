const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const imageLoader = document.getElementById('imageLoader');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');
const message = document.getElementById('message');

const rows = 3;
const cols = 3;
let pieces = [];
let img = new Image();

let imgPieceWidth, imgPieceHeight;
let imgDrawX, imgDrawY, imgDrawWidth, imgDrawHeight;

let selectedIndex = null;
let emptyIndex = rows * cols - 1;

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
    if(pieceNum === emptyIndex) continue;

    let sx = (pieceNum % cols) * imgPieceWidth;
    let sy = Math.floor(pieceNum / cols) * imgPieceHeight;

    let dx = imgDrawX + (i % cols) * (imgDrawWidth / cols);
    let dy = imgDrawY + Math.floor(i / cols) * (imgDrawHeight / rows);

    const drawPieceWidth = imgDrawWidth / cols;
    const drawPieceHeight = imgDrawHeight / rows;

    ctx.drawImage(img, sx, sy, imgPieceWidth, imgPieceHeight, dx, dy, drawPieceWidth, drawPieceHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(dx, dy, drawPieceWidth, drawPieceHeight);

    if(i === selectedIndex) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.strokeRect(dx + 2, dy + 2, drawPieceWidth - 4, drawPieceHeight - 4);
    }
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
  let n = pieces.length - 1;
  for(let i=n; i>0; i--) {
    let j = Math.floor(Math.random() * i);
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

  let clickX = x - rect.left;
  let clickY = y - rect.top;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  clickX *= scaleX;
  clickY *= scaleY;

  if(clickX < imgDrawX || clickX > imgDrawX + imgDrawWidth ||
     clickY < imgDrawY || clickY > imgDrawY + imgDrawHeight) {
    return null;
  }

  const relativeX = clickX - imgDrawX;
  const relativeY = clickY - imgDrawY;

  const pieceWidthCanvas = imgDrawWidth / cols;
  const pieceHeightCanvas = imgDrawHeight / rows;

  const col = Math.floor(relativeX / pieceWidthCanvas);
  const row = Math.floor(relativeY / pieceHeightCanvas);

  return row * cols + col;
}

canvas.addEventListener('click', (e) => {
  if(!img.src) return;
  const index = getClickedPiece(e.clientX, e.clientY);
  if(index === null) return;

  if(index === emptyIndex) {
    if(selectedIndex !== null && canSwap(selectedIndex)) {
      swapPieces(selectedIndex, emptyIndex);
      emptyIndex = selectedIndex;
      selectedIndex = null;
      drawPuzzle();
      if(isSolved()) showMessage('完成！おめでとうございます！');
    }
  } else {
    if(selectedIndex === index) {
      selectedIndex = null;
    } else {
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
      const canvasSize = 300;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      const imgW = img.width;
      const imgH = img.height;
      const imgRatio = imgW / imgH;
      const canvasRatio = canvas.width / canvas.height;

      if(imgRatio > canvasRatio) {
        imgDrawWidth = canvas.width;
        imgDrawHeight = canvas.width / imgRatio;
        imgDrawX = 0;
        imgDrawY = (canvas.height - imgDrawHeight) / 2;
      } else {
        imgDrawHeight = canvas.height;
        imgDrawWidth = canvas.height * imgRatio;
        imgDrawY = 0;
        imgDrawX = (canvas.width - imgDrawWidth) / 2;
      }

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

shuffleBtn.addEventListener('cli
