if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

const form = document.getElementById('estimateForm');
const list = document.getElementById('estimateList');

function saveData(data) {
  localStorage.setItem('estimates', JSON.stringify(data));
}

function loadData() {
  const raw = localStorage.getItem('estimates');
  return raw ? JSON.parse(raw) : [];
}

function renderList() {
  const data = loadData();
  list.innerHTML = '';
  data.forEach((item, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="item-title">${item.jobName}</div>
      <div>数量: ${item.quantity}</div>
      <button onclick="removeItem(${i})">削除</button>
    `;
    list.appendChild(li);
  });
}

function removeItem(index) {
  const data = loadData();
  data.splice(index, 1);
  saveData(data);
  renderList();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const jobName = form.jobName.value.trim();
  const quantity = form.quantity.value.trim();
  if (!jobName || !quantity) return;
  const data = loadData();
  data.push({ jobName, quantity });
  saveData(data);
  form.reset();
  renderList();
});

renderList();
