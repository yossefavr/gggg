const socket = new WebSocket('ws://' + location.host);
let mySymbol = '';
let myTurn = false;

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === 'welcome') {
    mySymbol = msg.symbol;
    myTurn = (mySymbol === 'X');
    alert(`You are player ${mySymbol}`);
  } 
  
  else if (msg.type === 'move') {
    const cell = document.getElementById('cell-' + msg.cell);
    if (cell.textContent === '') {
      cell.textContent = msg.symbol;
    }
    myTurn = (msg.symbol !== mySymbol);
  }
};

const board = document.getElementById('board');
for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.id = 'cell-' + i;
  cell.addEventListener('click', () => {
    if (cell.textContent === '' && myTurn) {
      cell.textContent = mySymbol;
      socket.send(JSON.stringify({ type: 'move', cell: i, symbol: mySymbol }));
      myTurn = false;
    }
  });
  board.appendChild(cell);
}
