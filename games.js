// Games & Trip Coins System
let tripCoins = parseInt(localStorage.getItem('tripCoins') || '0');
let gamesInitialized = false;

// Game State Vars
let currentGame = null;
let gameInterval = null;
let gameScore = 0;

// Caro Online Roles
let caroOnline_myTurn = 0; // 1: X (Initiator), 2: O (Receiver)
let caroOnline_turn = 1;
let caroOnline_board = [];
let caroOnline_size = 15;

function updateTripCoins(amount) {
    tripCoins += amount;
    localStorage.setItem('tripCoins', tripCoins);
    const displays = document.querySelectorAll('#trip-coins-val, #shop-coins-val');
    displays.forEach(d => d.textContent = tripCoins);
    if (amount > 0) {
        showToast(`+${amount} Trip Coins!`, 'success');
    }
}

function launchGame(gameId) {
    const modal = document.getElementById('game-modal');
    const container = document.getElementById('game-container');
    const title = document.getElementById('game-title');

    modal.style.display = 'flex';
    container.innerHTML = '';
    currentGame = gameId;
    gameScore = 0;

    if (gameInterval) clearInterval(gameInterval);

    switch(gameId) {
        case 'caro':
            title.textContent = 'Cờ Caro (Offline)';
            initCaro(container, false);
            break;
        case 'caro_online':
            title.textContent = 'Caro Online';
            initCaro(container, true);
            break;
        case 'snake':
            title.textContent = 'Rắn Săn Mồi';
            initSnake(container);
            break;
        case 'tetris':
            title.textContent = 'Xếp Hình';
            initTetris(container);
            break;
        case 'minesweeper':
            title.textContent = 'Dò Mìn';
            initMinesweeper(container);
            break;
        case '2048':
            title.textContent = '2048';
            init2048(container);
            break;
        case 'bird':
            title.textContent = 'Flappy Trip';
            initFlappyBird(container);
            break;
        case 'tank3d':
            title.textContent = 'Tank 3D Survival';
            initTank3D(container);
            break;
        case 'memory':
            title.textContent = 'Trí Nhớ';
            initMemoryGame(container);
            break;
        case 'whack':
            title.textContent = 'Đập Chuột';
            initWhackAMole(container);
            break;
        case 'sudoku':
            title.textContent = 'Sudoku';
            initSudoku(container);
            break;
        case 'pong':
            title.textContent = 'Bóng Bàn';
            initPong(container);
            break;
    }
}

function closeGame() {
    document.getElementById('game-modal').style.display = 'none';
    if (gameInterval) clearInterval(gameInterval);
    currentGame = null;
}

// --- CARO LOGIC (Offline & Online) ---
function initCaro(container, isOnline) {
    const size = 15;
    caroOnline_size = size;
    caroOnline_board = Array(size).fill(null).map(() => Array(size).fill(0));
    caroOnline_turn = 1;

    if (isOnline) {
        // Assign turn based on webrtc connection state
        if (!dataChannel || !dataChannel.open) {
            container.innerHTML = `<div style="padding:20px; text-align:center;">
                <p>Bạn cần kết nối với bạn bè trước để chơi Online.</p>
                <button onclick="closeGame(); showWebRTCModal();" style="margin-top:10px;">Mở Kết Nối</button>
            </div>`;
            return;
        }
        // Initiator is X (1), Receiver is O (2)
        caroOnline_myTurn = isInitiator ? 1 : 2;

        // Sync init
        if (isInitiator) {
            sendData({ type: 'caro_init', size: size });
        }
    }

    const gameDiv = document.createElement('div');
    gameDiv.className = 'caro-container';

    const turnInfo = document.createElement('div');
    turnInfo.id = 'caro-status';
    turnInfo.style.marginBottom = '10px';
    turnInfo.style.fontWeight = 'bold';
    turnInfo.style.textAlign = 'center';
    updateCaroStatus(turnInfo, isOnline);

    const boardDiv = document.createElement('div');
    boardDiv.className = 'caro-board';
    boardDiv.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement('div');
            cell.className = 'caro-cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.onclick = () => handleCaroClick(r, c, isOnline, boardDiv, turnInfo);
            boardDiv.appendChild(cell);
        }
    }

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Làm mới';
    resetBtn.style.marginTop = '10px';
    resetBtn.onclick = () => {
        if (isOnline) sendData({ type: 'caro_reset' });
        initCaro(container, isOnline);
    };

    gameDiv.appendChild(turnInfo);
    gameDiv.appendChild(boardDiv);
    gameDiv.appendChild(resetBtn);
    container.appendChild(gameDiv);
}

function updateCaroStatus(el, isOnline) {
    if (!isOnline) {
        el.textContent = `Lượt của: ${caroOnline_turn === 1 ? 'X (Bạn)' : 'O (Bot)'}`;
    } else {
        const symbol = caroOnline_turn === 1 ? 'X (Xanh)' : 'O (Đỏ)';
        const mySymbol = caroOnline_myTurn === 1 ? 'X (Xanh)' : 'O (Đỏ)';
        const isMyTurn = caroOnline_turn === caroOnline_myTurn;
        el.innerHTML = `Bạn: <span style="color:${caroOnline_myTurn === 1 ? '#3b82f6':'#ef4444'}">${mySymbol}</span><br>` +
                       `Lượt: <span style="color:${caroOnline_turn === 1 ? '#3b82f6':'#ef4444'}">${symbol}</span> ` +
                       `(${isMyTurn ? 'Lượt của bạn' : 'Đang đợi...'})`;
    }
}

function handleCaroClick(r, c, isOnline, boardDiv, statusEl) {
    if (caroOnline_board[r][c] !== 0) return;

    if (isOnline) {
        if (caroOnline_turn !== caroOnline_myTurn) {
            showToast("Chưa đến lượt của bạn!", "info");
            return;
        }
        applyCaroMove(r, c, boardDiv);
        sendData({ type: 'caro_move', r, c });
        checkCaroWin(r, c, true);
        updateCaroStatus(statusEl, true);
    } else {
        // Offline vs Bot
        if (caroOnline_turn !== 1) return;
        applyCaroMove(r, c, boardDiv);
        if (checkCaroWin(r, c, false)) return;

        statusEl.textContent = "Bot đang suy nghĩ...";
        setTimeout(() => {
            const botMove = getBotMove();
            applyCaroMove(botMove.r, botMove.c, boardDiv);
            checkCaroWin(botMove.r, botMove.c, false);
            updateCaroStatus(statusEl, false);
        }, 500);
    }
}

function applyCaroMove(r, c, boardDiv) {
    const cell = boardDiv.querySelector(`[data-r='${r}'][data-c='${c}']`);
    caroOnline_board[r][c] = caroOnline_turn;
    cell.textContent = caroOnline_turn === 1 ? 'X' : 'O';
    cell.classList.add(caroOnline_turn === 1 ? 'x-move' : 'o-move');
    caroOnline_turn = caroOnline_turn === 1 ? 2 : 1;
}

function handleOnlineCaroMove(data) {
    const boardDiv = document.querySelector('.caro-board');
    const statusEl = document.getElementById('caro-status');
    if (boardDiv && statusEl) {
        applyCaroMove(data.r, data.c, boardDiv);
        checkCaroWin(data.r, data.c, true);
        updateCaroStatus(statusEl, true);
    }
}

function checkCaroWin(r, c, isOnline) {
    const symbol = caroOnline_board[r][c];
    const directions = [[1,0], [0,1], [1,1], [1,-1]];

    for (let [dr, dc] of directions) {
        let count = 1;
        // Positive direction
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < caroOnline_size && nc >= 0 && nc < caroOnline_size && caroOnline_board[nr][nc] === symbol) {
            count++; nr += dr; nc += dc;
        }
        // Negative direction
        nr = r - dr; nc = c - dc;
        while (nr >= 0 && nr < caroOnline_size && nc >= 0 && nc < caroOnline_size && caroOnline_board[nr][nc] === symbol) {
            count++; nr -= dr; nc -= dc;
        }

        if (count >= 5) {
            const winner = symbol === 1 ? 'X' : 'O';
            showInfoModal("Kết quả", `Người chơi ${winner} đã chiến thắng!`);
            if (!isOnline && symbol === 1) updateTripCoins(10);
            return true;
        }
    }
    return false;
}

function getBotMove() {
    // Simple bot: random empty cell
    let empty = [];
    for(let r=0; r<caroOnline_size; r++) {
        for(let c=0; c<caroOnline_size; c++) {
            if(caroOnline_board[r][c] === 0) empty.push({r,c});
        }
    }
    return empty[Math.floor(Math.random() * empty.length)];
}

// --- SNAKE LOGIC ---
function initSnake(container) {
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 300;
    canvas.style.background = '#000';
    canvas.style.borderRadius = '8px';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const box = 15;
    let snake = [{x: 9*box, y: 10*box}];
    let food = { x: Math.floor(Math.random()*19+1)*box, y: Math.floor(Math.random()*19+1)*box };
    let d = "RIGHT";

    document.addEventListener('keydown', e => {
        if(e.keyCode == 37 && d != "RIGHT") d = "LEFT";
        else if(e.keyCode == 38 && d != "DOWN") d = "UP";
        else if(e.keyCode == 39 && d != "LEFT") d = "RIGHT";
        else if(e.keyCode == 40 && d != "UP") d = "DOWN";
    });

    // Mobile controls
    const controls = document.createElement('div');
    controls.className = 'game-dpad';
    controls.innerHTML = `
        <button onclick="window.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 38}))">↑</button>
        <div style="display:flex; gap:10px;">
            <button onclick="window.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 37}))">←</button>
            <button onclick="window.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 40}))">↓</button>
            <button onclick="window.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 39}))">→</button>
        </div>
    `;
    container.appendChild(controls);

    gameInterval = setInterval(() => {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 300, 300);

        for(let i=0; i<snake.length; i++) {
            ctx.fillStyle = (i==0) ? "green" : "lime";
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
        }

        ctx.fillStyle = "red";
        ctx.fillRect(food.x, food.y, box, box);

        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        if(d == "LEFT") snakeX -= box;
        if(d == "UP") snakeY -= box;
        if(d == "RIGHT") snakeX += box;
        if(d == "DOWN") snakeY += box;

        if(snakeX == food.x && snakeY == food.y) {
            gameScore++;
            updateTripCoins(1);
            food = { x: Math.floor(Math.random()*19+1)*box, y: Math.floor(Math.random()*19+1)*box };
        } else {
            snake.pop();
        }

        let newHead = {x: snakeX, y: snakeY};

        if(snakeX < 0 || snakeX >= 300 || snakeY < 0 || snakeY >= 300 || collision(newHead, snake)) {
            clearInterval(gameInterval);
            showInfoModal("Game Over", `Rắn đã chết! Điểm: ${gameScore}`);
        }

        snake.unshift(newHead);
    }, 150);

    function collision(head, array) {
        for(let i=0; i<array.length; i++) {
            if(head.x == array[i].x && head.y == array[i].y) return true;
        }
        return false;
    }
}

// --- FLAPPY BIRD ---
function initFlappyBird(container) {
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 400;
    canvas.style.background = '#70c5ce';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let bird = { x: 50, y: 150, w: 20, h: 20, gravity: 0.6, lift: -10, velocity: 0 };
    let pipes = [];
    let frame = 0;

    canvas.onclick = () => bird.velocity = bird.lift;

    gameInterval = setInterval(() => {
        ctx.clearRect(0, 0, 300, 400);

        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        ctx.fillStyle = "yellow";
        ctx.fillRect(bird.x, bird.y, bird.w, bird.h);

        if(frame % 90 == 0) {
            let space = 100;
            let h = Math.random() * (200 - 50) + 50;
            pipes.push({ x: 300, top: h, bottom: 400 - h - space });
        }

        ctx.fillStyle = "green";
        pipes.forEach((p, i) => {
            p.x -= 2;
            ctx.fillRect(p.x, 0, 40, p.top);
            ctx.fillRect(p.x, 400 - p.bottom, 40, p.bottom);

            if(bird.x + bird.w > p.x && bird.x < p.x + 40 && (bird.y < p.top || bird.y + bird.h > 400 - p.bottom)) {
                clearInterval(gameInterval);
                showInfoModal("Game Over", `Bạn đã va chạm! Điểm: ${gameScore}`);
                updateTripCoins(Math.floor(gameScore/5));
            }
            if(p.x == 40) gameScore++;
        });

        if(pipes.length > 0 && pipes[0].x < -40) pipes.shift();
        if(bird.y > 400 || bird.y < 0) {
            clearInterval(gameInterval);
            showInfoModal("Game Over", `Rơi khỏi bản đồ! Điểm: ${gameScore}`);
        }
        frame++;
    }, 1000/60);
}

// --- TANK 3D (Pseudo) ---
function initTank3D(container) {
    container.innerHTML = `
        <div style="position:relative; width:300px; height:300px; background:#333; overflow:hidden; border-radius:8px;">
            <div id="tank-3d-scene" style="width:100%; height:100%; perspective:600px;">
                <div id="tank-player" style="position:absolute; width:30px; height:40px; background:green; left:135px; top:200px; transition: transform 0.1s;"></div>
            </div>
            <div style="position:absolute; bottom:10px; left:10px; color:white; font-size:12px;">SCORE: <span id="tank-score">0</span></div>
        </div>
        <div class="game-dpad">
            <button onmousedown="moveTank('up')">↑</button>
            <div style="display:flex; gap:10px;">
                <button onmousedown="moveTank('left')">←</button>
                <button onmousedown="shootTank()">🔥</button>
                <button onmousedown="moveTank('right')">→</button>
            </div>
            <button onmousedown="moveTank('down')">↓</button>
        </div>
    `;
    let tankPos = {x: 135, y: 200, angle: 0};
    window.moveTank = (dir) => {
        if(dir=='up') tankPos.y -= 10;
        if(dir=='down') tankPos.y += 10;
        if(dir=='left') tankPos.angle -= 15;
        if(dir=='right') tankPos.angle += 15;
        const t = document.getElementById('tank-player');
        if(t) t.style.transform = `translate(${tankPos.x - 135}px, ${tankPos.y - 200}px) rotate(${tankPos.angle}deg)`;
    };
    window.shootTank = () => {
        gameScore += 10;
        document.getElementById('tank-score').textContent = gameScore;
        updateTripCoins(2);
    };
}

// --- SHOP LOGIC ---
const shopItems = {
    tanks: [
        { id: 't1', name: 'Tiger Red', price: 100, icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#ef4444"><path d="M13,22H11V18H13V22M19,19H5V17H19V19M15,14H9V8H15V14M12,2L14,5H10L12,2Z"/></svg>' },
        { id: 't2', name: 'Abrams Gold', price: 500, icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#f59e0b"><path d="M13,22H11V18H13V22M19,19H5V17H19V19M15,14H9V8H15V14M12,2L14,5H10L12,2Z"/></svg>' }
    ],
    skins: [
        { id: 's1', name: 'Camo Blue', price: 50, icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#3b82f6"><path d="M12,2L4,5V11C4,16.07 7.41,20.84 12,22C16.59,20.84 20,16.07 20,11V5L12,2Z"/></svg>' },
        { id: 's2', name: 'Neon Night', price: 200, icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#a855f7"><path d="M12,2L4,5V11C4,16.07 7.41,20.84 12,22C16.59,20.84 20,16.07 20,11V5L12,2Z"/></svg>' }
    ],
    boosts: [
        { id: 'b1', name: 'X2 Coins (1h)', price: 300, icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#22c55e"><path d="M13,2.05L9,2.05V4.05L11,4.05V13.11L5.42,18.69L6.83,20.1L12.41,14.52L17.99,20.1L19.41,18.69L13.82,13.11V4.05L15.82,4.05V2.05L11.82,2.05L13,2.05Z"/></svg>' }
    ]
};

function showGameShop() {
    document.getElementById('shop-modal').style.display = 'flex';
    document.getElementById('shop-coins-val').textContent = tripCoins;
    switchShopTab('tanks');
}

function closeShop() {
    document.getElementById('shop-modal').style.display = 'none';
}

function switchShopTab(tab) {
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';

    shopItems[tab].forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-item-card';
        card.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-price">${item.price} Coins</div>
            <button onclick="buyItem('${item.id}', ${item.price})">Mua</button>
        `;
        grid.appendChild(card);
    });
}

function buyItem(id, price) {
    if(tripCoins >= price) {
        updateTripCoins(-price);
        showToast("Mua hàng thành công!", "success");
    } else {
        showToast("Không đủ Trip Coins!", "error");
    }
}

// Initial Coins display
window.addEventListener('load', () => {
    updateTripCoins(0);
});

// Other games placeholders
function initTetris(c){ c.innerHTML = '<p style="text-align:center; padding:40px;">Tetris is coming soon!</p>'; }
function initMinesweeper(c){ c.innerHTML = '<p style="text-align:center; padding:40px;">Minesweeper is coming soon!</p>'; }
function init2048(c){ c.innerHTML = '<p style="text-align:center; padding:40px;">2048 is coming soon!</p>'; }
function initSudoku(c){ c.innerHTML = '<p style="text-align:center; padding:40px;">Sudoku is coming soon!</p>'; }
function initMemoryGame(c){ c.innerHTML = '<p style="text-align:center; padding:40px;">Memory Game is coming soon!</p>'; }
function initWhackAMole(c){ c.innerHTML = '<p style="text-align:center; padding:40px;">Whack A Mole is coming soon!</p>'; }
function initPong(c){ c.innerHTML = '<p style="text-align:center; padding:40px;">Pong is coming soon!</p>'; }
