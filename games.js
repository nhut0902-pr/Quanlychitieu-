// --- Trip Coins System ---
let tripCoins = parseInt(localStorage.getItem('tripCoins')) || 500;
let ownedItems = JSON.parse(localStorage.getItem('ownedItems')) || ['default_tank'];

function saveGameData() {
    localStorage.setItem('tripCoins', tripCoins);
    localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
    updateCoinsUI();
}

function updateCoinsUI() {
    const el1 = document.getElementById('trip-coins-val');
    const el2 = document.getElementById('shop-coins-val');
    if (el1) el1.innerText = tripCoins;
    if (el2) el2.innerText = tripCoins;
}

window.addTripCoins = function(amount) {
    tripCoins += amount;
    saveGameData();
};

window.initGamesHub = function() {
    updateCoinsUI();
};

// --- Game Modal Management ---
window.launchGame = function(gameId) {
    const modal = document.getElementById('game-modal');
    const container = document.getElementById('game-container');
    const title = document.getElementById('game-title');
    const controls = document.getElementById('game-controls-overlay');

    modal.style.display = 'flex';
    container.innerHTML = '<canvas id="game-canvas"></canvas>';
    controls.style.display = 'none';
    controls.innerHTML = '';
    window.gameActive = true;

    title.innerText = gameId.toUpperCase();
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    switch(gameId) {
        case 'tank3d': startTankGame(canvas, ctx); break;
        case 'caro': startCaroGame(canvas, ctx); break;
        case 'caro_online': startCaroOnlineGame(canvas, ctx); break;
        case 'snake': startSnakeGame(canvas, ctx); break;
        case 'tetris': startTetrisGame(canvas, ctx); break;
        case 'minesweeper': startMinesGame(canvas, ctx); break;
        case '2048': start2048Game(canvas, ctx); break;
        case 'sudoku': startSudokuGame(canvas, ctx); break;
        case 'bird': startBirdGame(canvas, ctx); break;
        case 'memory': startMemoryGame(canvas, ctx); break;
        case 'whack': startWhackGame(canvas, ctx); break;
        case 'pong': startPongGame(canvas, ctx); break;
    }
};

window.closeGame = function() {
    const modal = document.getElementById('game-modal');
    modal.style.display = 'none';
    window.gameActive = false;
    if (window.gameLoop) cancelAnimationFrame(window.gameLoop);
    if (window.gameInterval) clearInterval(window.gameInterval);
};

// --- GAME 1: TANK 3D ---
function startTankGame(canvas, ctx) {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight - 100;
    let tank = { x: canvas.width/2, y: canvas.height/2, angle: 0, hp: 100, score: 0, bullets: [], enemies: [] };
    let joystick = { x: 0, y: 0 };
    let currentMap = '#edc9af';
    let gameMode = 'survival';
    let timeLeft = 60;

    const controls = document.getElementById('game-controls-overlay');
    controls.style.display = 'block';
    controls.innerHTML = `
        <div id="joystick" class="joystick-container"><div id="joystick-knob" class="joystick-knob"></div></div>
        <div id="fire-btn" class="fire-btn">BẮN</div>
        <div style="position:absolute; top:10px; left:10px; color:white; font-family:monospace; background:rgba(0,0,0,0.7); padding:8px; border-radius:8px; font-size:11px; pointer-events:auto;">
            HP: <span id="hp-val">100</span> | Map:
            <select onchange="window.setTankMap(this.value)" style="padding:1px; font-size:10px; width:auto; height:auto; color:black;">
                <option value="#edc9af">Desert</option><option value="#2d5a27">Forest</option><option value="#4b4b4b">City</option>
                <option value="#ffffff">Snow</option><option value="#1a1a1a">Base</option>
            </select><br>
            Mode: <select onchange="window.setTankMode(this.value)" style="padding:1px; font-size:10px; width:auto; height:auto; color:black;">
                <option value="survival">Sinh Tồn</option><option value="time">Tính Giờ</option><option value="hunt">Săn Đuổi</option>
            </select>
            <span id="tank-timer" style="display:none"> | T: <span id="time-val">60</span>s</span>
        </div>
    `;

    window.setTankMap = (val) => currentMap = val;
    window.setTankMode = (val) => {
        gameMode = val;
        document.getElementById('tank-timer').style.display = (val === 'time') ? 'inline' : 'none';
        timeLeft = 60;
    };

    const joy = document.getElementById('joystick');
    const knob = document.getElementById('joystick-knob');
    joy.ontouchmove = (e) => {
        const touch = e.touches[0]; const rect = joy.getBoundingClientRect();
        const dx = touch.clientX - (rect.left + rect.width/2);
        const dy = touch.clientY - (rect.top + rect.height/2);
        const dist = Math.min(60, Math.sqrt(dx*dx + dy*dy));
        const angle = Math.atan2(dy, dx);
        knob.style.transform = `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px))`;
        joystick = { x: Math.cos(angle)*(dist/60), y: Math.sin(angle)*(dist/60) };
    };
    joy.ontouchend = () => { joystick = {x:0, y:0}; knob.style.transform = 'translate(-50%, -50%)'; };
    document.getElementById('fire-btn').onclick = () => tank.bullets.push({ x: tank.x, y: tank.y, angle: tank.angle, speed: 10 });

    function loop() {
        if (!window.gameActive) return;
        ctx.fillStyle = currentMap; ctx.fillRect(0,0,canvas.width,canvas.height);

        if (gameMode === 'time') {
            timeLeft -= 1/60;
            document.getElementById('time-val').innerText = Math.ceil(timeLeft);
            if (timeLeft <= 0) { alert("Hết giờ! Điểm: " + tank.score); closeGame(); return; }
        }

        if(joystick.x || joystick.y) { tank.angle = Math.atan2(joystick.y, joystick.x); tank.x += joystick.x*4; tank.y += joystick.y*4; }
        tank.x = Math.max(20, Math.min(canvas.width-20, tank.x)); tank.y = Math.max(20, Math.min(canvas.height-20, tank.y));

        // Player
        ctx.save(); ctx.translate(tank.x, tank.y); ctx.rotate(tank.angle);
        ctx.fillStyle = ownedItems.includes('gold_skin') ? '#fbbf24' : '#6366f1';
        ctx.fillRect(-20, -15, 40, 30); ctx.fillStyle='black'; ctx.fillRect(10,-3,25,6); ctx.restore();

        if (Math.random() < 0.02 && tank.enemies.length < (gameMode === 'hunt' ? 6 : 3)) tank.enemies.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, angle: Math.random()*Math.PI*2, hp: 50});

        tank.enemies.forEach((en, ei) => {
            en.angle += 0.01; en.x += Math.cos(en.angle)*2; en.y += Math.sin(en.angle)*2;
            ctx.save(); ctx.translate(en.x, en.y); ctx.rotate(en.angle); ctx.fillStyle='red'; ctx.fillRect(-15,-10,30,20); ctx.restore();
            if(Math.hypot(tank.x-en.x, tank.y-en.y) < 30) tank.hp -= 0.1;
        });

        tank.bullets = tank.bullets.filter(b => {
            b.x += Math.cos(b.angle)*b.speed; b.y += Math.sin(b.angle)*b.speed;
            ctx.fillStyle='yellow'; ctx.beginPath(); ctx.arc(b.x,b.y,4,0,Math.PI*2); ctx.fill();
            let hit = false;
            tank.enemies.forEach((en, ei) => {
                if(Math.hypot(b.x-en.x, b.y-en.y) < 25) { en.hp -= 25; hit=true; if(en.hp<=0) {tank.enemies.splice(ei,1); tank.score+=100; window.addTripCoins(10);} }
            });
            return !hit && b.x>0 && b.x<canvas.width && b.y>0 && b.y<canvas.height;
        });

        document.getElementById('hp-val').innerText = Math.round(tank.hp);
        if(tank.hp <= 0) { alert("Game Over! Score: " + tank.score); closeGame(); return; }
        window.gameLoop = requestAnimationFrame(loop);
    }
    loop();
}

// --- GAME 2: CARO (Gomoku) ---
function startCaroGame(canvas, ctx) {
    initCaroInternal(canvas, ctx, false);
}

function startCaroOnlineGame(canvas, ctx) {
    if (window.initWebRTC) window.initWebRTC();
    document.getElementById('webrtc-modal').style.display = 'flex';
    initCaroInternal(canvas, ctx, true);
}

function initCaroInternal(canvas, ctx, isOnline) {
    let size = 15; let cellSize = 30; canvas.width = 450; canvas.height = 450;
    let board = Array(size).fill().map(()=>Array(size).fill(0));
    let turn = 1, gameEnded = false, difficulty = 1;
    let myTurn = isOnline ? (window.isWebRTCInitiator ? 1 : 2) : 1;

    const controls = document.getElementById('game-controls-overlay');
    controls.style.display = 'block';
    controls.innerHTML = `<div style="position:absolute; top:5px; left:5px; display:flex; flex-direction:column; gap:5px; background:rgba(255,255,255,0.9); padding:10px; border-radius:8px; pointer-events:auto; font-size:12px;">
        <div id="caro-status" style="font-weight:bold; color:var(--primary); margin-bottom:4px;">${isOnline ? 'Đang kết nối...' : 'Lượt của bạn (X)'}</div>
        <div style="display:flex; gap:5px; align-items:center;">
            Size: <select onchange="window.initCaro(this.value)" style="width:auto;height:auto;padding:0;" ${isOnline ? 'disabled' : ''}><option value="10">10</option><option value="15" selected>15</option><option value="20">20</option></select>
            ${!isOnline ? 'Diff: <select onchange="difficulty=parseInt(this.value)" style="width:auto;height:auto;padding:0;"><option value="0">Dễ</option><option value="1" selected>Vừa</option></select>' : ''}
        </div>
        <button onclick="window.initCaro()" style="padding:4px; font-size:11px;">Chơi mới</button>
    </div>`;

    window.initCaro = (s) => {
        if(s) { size=parseInt(s); cellSize=450/size; }
        board = Array(size).fill().map(()=>Array(size).fill(0));
        gameEnded=false; turn=1; draw();
        if(isOnline) window.sendWebRTCData({type: 'caro_init', size: size});
    };

    function draw() {
        ctx.fillStyle='#fff'; ctx.fillRect(0,0,450,450);
        ctx.strokeStyle='#ccc'; for(let i=0; i<=size; i++) { ctx.beginPath(); ctx.moveTo(i*cellSize,0); ctx.lineTo(i*cellSize,450); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*cellSize); ctx.lineTo(450,i*cellSize); ctx.stroke(); }
        for(let y=0; y<size; y++) for(let x=0; x<size; x++) {
            if(board[y][x]===1) { ctx.strokeStyle='blue'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x*cellSize+5,y*cellSize+5); ctx.lineTo((x+1)*cellSize-5,(y+1)*cellSize-5); ctx.moveTo((x+1)*cellSize-5,y*cellSize+5); ctx.lineTo(x*cellSize+5,(y+1)*cellSize-5); ctx.stroke(); }
            if(board[y][x]===2) { ctx.strokeStyle='red'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x*cellSize+cellSize/2, y*cellSize+cellSize/2, cellSize/2-5, 0, Math.PI*2); ctx.stroke(); }
        }
    }

    window.makeCaroMove = (y, x, remote) => {
        if(gameEnded || board[y][x] !== 0) return;
        if(!remote && isOnline && turn !== myTurn) return;

        board[y][x] = turn;
        draw();
        const statusEl = document.getElementById('caro-status');
        if(checkWin(y, x, turn)) {
            if (statusEl) statusEl.innerText = turn === myTurn ? "BẠN THẮNG!" : "ĐỐI THỦ THẮNG!";
            alert(turn === myTurn ? "Bạn thắng!" : "Đối thủ thắng!");
            gameEnded = true;
        } else {
            turn = (turn === 1) ? 2 : 1;
            if (statusEl) {
                if (isOnline) statusEl.innerText = turn === myTurn ? "Lượt của bạn" : "Đợi đối thủ...";
                else statusEl.innerText = turn === 1 ? "Lượt của bạn (X)" : "Bot đang nghĩ...";
            }
            if(!remote && isOnline) window.sendWebRTCData({type: 'caro_move', y, x});
            if(!isOnline && turn === 2) setTimeout(bot, 400);
        }
    };

    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX-rect.left)/cellSize);
        const y = Math.floor((e.clientY-rect.top)/cellSize);
        window.makeCaroMove(y, x, false);
    };

    function bot() {
        if(gameEnded) return;
        let move = {y:-1, x:-1};
        // Blocking AI
        outer: for(let y=0; y<size; y++) for(let x=0; x<size; x++) if(board[y][x]===0) { board[y][x]=1; if(checkWin(y,x,1)) { board[y][x]=0; move={y,x}; break outer; } board[y][x]=0; }
        if(move.y===-1) { outer2: for(let y=0; y<size; y++) for(let x=0; x<size; x++) if(board[y][x]===0) { move={y,x}; break outer2; } }
        if(move.y!==-1) window.makeCaroMove(move.y, move.x, true);
    }

    function checkWin(y, x, p) {
        const dirs = [[1,0],[0,1],[1,1],[1,-1]];
        for(let [dy,dx] of dirs) {
            let count=1;
            for(let i=1;i<5;i++){ let ny=y+dy*i,nx=x+dx*i; if(ny>=0&&ny<size&&nx>=0&&nx<size&&board[ny][nx]===p) count++; else break; }
            for(let i=1;i<5;i++){ let ny=y-dy*i,nx=x-dx*i; if(ny>=0&&ny<size&&nx>=0&&nx<size&&board[ny][nx]===p) count++; else break; }
            if(count>=5) return true;
        }
        return false;
    }
    draw();
}

window.handleRemoteCaroMove = (y, x) => { if(window.makeCaroMove) window.makeCaroMove(y, x, true); };
window.handleRemoteCaroInit = (size) => { if(window.initCaro) window.initCaro(size, true); };

// --- GAME 3: SNAKE ---
function startSnakeGame(canvas, ctx) {
    canvas.width=400; canvas.height=400;
    let snake = [{x:10,y:10}], food = {x:15,y:15}, dx=1, dy=0, score=0;
    window.gameInterval = setInterval(() => {
        let h = {x:snake[0].x+dx, y:snake[0].y+dy};
        if(h.x<0||h.x>=20||h.y<0||h.y>=20||snake.some(s=>s.x===h.x&&s.y===h.y)) { clearInterval(window.gameInterval); alert("Game Over!"); return; }
        snake.unshift(h);
        if(h.x===food.x && h.y===food.y) { food={x:Math.floor(Math.random()*20), y:Math.floor(Math.random()*20)}; score++; window.addTripCoins(2); } else snake.pop();
        ctx.fillStyle='#000'; ctx.fillRect(0,0,400,400);
        ctx.fillStyle='lime'; snake.forEach(s=>ctx.fillRect(s.x*20,s.y*20,19,19));
        ctx.fillStyle='red'; ctx.fillRect(food.x*20,food.y*20,19,19);
    }, 150);
    canvas.onclick = (e) => {
        const r = canvas.getBoundingClientRect(); const x = e.clientX-r.left, y = e.clientY-r.top;
        if(Math.abs(x-200) > Math.abs(y-200)) { if(x>200 && dx===0) {dx=1;dy=0;} else if(x<200 && dx===0) {dx=-1;dy=0;} }
        else { if(y>200 && dy===0) {dx=0;dy=1;} else if(y<200 && dy===0) {dx=0;dy=-1;} }
    };
}

// --- GAME 4: TETRIS ---
function startTetrisGame(canvas, ctx) {
    canvas.width=240; canvas.height=400; let score=0;
    let piece = {pos:{x:5,y:0}, matrix:[[0,1,0],[1,1,1],[0,0,0]]};
    window.gameInterval = setInterval(() => {
        piece.pos.y++; if(piece.pos.y > 18) { piece.pos.y=0; piece.pos.x=Math.floor(Math.random()*9); score+=10; window.addTripCoins(1); }
        ctx.fillStyle='#000'; ctx.fillRect(0,0,240,400);
        ctx.fillStyle='#6366f1'; piece.matrix.forEach((r,y)=>r.forEach((v,x)=>{if(v)ctx.fillRect((x+piece.pos.x)*20,(y+piece.pos.y)*20,19,19);}));
        ctx.fillStyle='white'; ctx.fillText("Score: "+score, 10, 20);
    }, 400);
}

// --- GAME 5: MINESWEEPER ---
function startMinesGame(canvas, ctx) {
    canvas.width=300; canvas.height=300; let size=10;
    let grid = Array(size).fill().map(()=>Array(size).fill(0).map(()=>Math.random()<0.15?1:0));
    let revealed = Array(size).fill().map(()=>Array(size).fill(false));
    function draw() {
        ctx.fillStyle='#fff'; ctx.fillRect(0,0,300,300);
        for(let y=0; y<size; y++) for(let x=0; x<size; x++) {
            ctx.strokeStyle='#999'; ctx.strokeRect(x*30,y*30,30,30);
            if(revealed[y][x]) { if(grid[y][x]===1) { ctx.fillStyle='red'; ctx.fillRect(x*30+5,y*30+5,20,20); } else { ctx.fillStyle='#ddd'; ctx.fillRect(x*30+1,y*30+1,28,28); } }
        }
    }
    canvas.onclick = (e) => {
        const r = canvas.getBoundingClientRect(); const x = Math.floor((e.clientX-r.left)/30), y = Math.floor((e.clientY-r.top)/30);
        revealed[y][x]=true; draw(); if(grid[y][x]===1) alert("Bùm! Bạn đã thua."); else { window.addTripCoins(5); }
    };
    draw();
}

// --- GAME 6: 2048 ---
function start2048Game(canvas, ctx) {
    canvas.width=300; canvas.height=300; let grid = [0,0,2,0, 0,4,0,0, 0,0,2,2, 0,8,0,0];
    function draw() {
        ctx.fillStyle='#bbada0'; ctx.fillRect(0,0,300,300);
        grid.forEach((v,i) => {
            let x=(i%4)*75+5, y=Math.floor(i/4)*75+5;
            ctx.fillStyle = v ? '#eee4da' : '#cdc1b4'; ctx.fillRect(x,y,65,65);
            if(v) { ctx.fillStyle='#776e65'; ctx.font='20px Arial'; ctx.textAlign='center'; ctx.fillText(v, x+32, y+40); }
        });
    }
    canvas.onclick = () => {
        let empty = grid.map((v,i)=>v===0?i:null).filter(v=>v!==null);
        if(empty.length) grid[empty[Math.floor(Math.random()*empty.length)]] = 2;
        draw(); window.addTripCoins(2);
    };
    draw();
}

// --- GAME 7: SUDOKU ---
function startSudokuGame(canvas, ctx) {
    canvas.width=300; canvas.height=300;
    function draw() {
        ctx.fillStyle='#fff'; ctx.fillRect(0,0,300,300); ctx.strokeStyle='#000'; ctx.lineWidth=1;
        for(let i=0; i<=9; i++) { ctx.lineWidth = i%3===0 ? 3 : 1; ctx.beginPath(); ctx.moveTo(i*33.3,0); ctx.lineTo(i*33.3,300); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*33.3); ctx.lineTo(300,i*33.3); ctx.stroke(); }
        ctx.fillStyle='blue'; ctx.font='20px Arial'; ctx.fillText("5", 10, 25); ctx.fillText("3", 45, 25);
    }
    canvas.onclick = () => { window.addTripCoins(10); alert("Sudoku Solved! +10 Coins"); };
    draw();
}

// --- GAME 8: FLAPPY TRIP ---
function startBirdGame(canvas, ctx) {
    canvas.width=320; canvas.height=480; let y=240, v=0, score=0;
    window.gameInterval = setInterval(() => {
        v+=0.5; y+=v; ctx.fillStyle='skyblue'; ctx.fillRect(0,0,320,480);
        ctx.fillStyle='yellow'; ctx.fillRect(50,y,30,30);
        if(y>450 || y<0) { clearInterval(window.gameInterval); alert("Rớt rồi! Score: "+score); }
        if(Math.random()<0.01) { score++; window.addTripCoins(1); }
    }, 20);
    canvas.onclick = () => v = -8;
}

// --- GAME 9: MEMORY ---
function startMemoryGame(canvas, ctx) {
    canvas.width=300; canvas.height=300; let flipped = Array(8).fill(false);
    function draw() {
        ctx.fillStyle='#444'; ctx.fillRect(0,0,300,300);
        flipped.forEach((f,i)=>{ let x=(i%3)*100+5, y=Math.floor(i/3)*100+5; ctx.fillStyle = f ? '#fff' : '#6366f1'; ctx.fillRect(x,y,90,90); });
    }
    canvas.onclick = (e) => {
        const r = canvas.getBoundingClientRect(); const i = Math.floor((e.clientX-r.left)/100) + Math.floor((e.clientY-r.top)/100)*3;
        if(i<8) { flipped[i]=!flipped[i]; draw(); window.addTripCoins(1); }
    };
    draw();
}

// --- GAME 10: WHACK ---
function startWhackGame(canvas, ctx) {
    canvas.width=300; canvas.height=300; let mole = {x:0,y:0};
    window.gameInterval = setInterval(() => {
        mole = {x: Math.random()*250, y: Math.random()*250};
        ctx.fillStyle='#2d5a27'; ctx.fillRect(0,0,300,300);
        ctx.fillStyle='brown'; ctx.beginPath(); ctx.arc(mole.x+25, mole.y+25, 20, 0, Math.PI*2); ctx.fill();
    }, 1000);
    canvas.onclick = (e) => {
        const r = canvas.getBoundingClientRect(); const x = e.clientX-r.left, y = e.clientY-r.top;
        if(Math.hypot(x-(mole.x+25), y-(mole.y+25)) < 30) { window.addTripCoins(10); alert("Trúng rồi! +10 Coins"); }
    };
}

// --- GAME 11: PONG ---
function startPongGame(canvas, ctx) {
    canvas.width=300; canvas.height=400; let b={x:150,y:200,vx:3,vy:3}, p=150;
    window.gameInterval = setInterval(() => {
        b.x+=b.vx; b.y+=b.vy; if(b.x<0||b.x>300)b.vx*=-1;
        if(b.y<0) b.vy*=-1;
        if(b.y>380 && b.x>p-40 && b.x<p+40) { b.vy*=-1; window.addTripCoins(2); }
        if(b.y>400) { clearInterval(window.gameInterval); alert("Thua rồi!"); }
        ctx.fillStyle='#000'; ctx.fillRect(0,0,300,400);
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(b.x,b.y,5,0,Math.PI*2); ctx.fill();
        ctx.fillRect(p-40, 385, 80, 10);
    }, 16);
    canvas.onclick = (e) => { const r = canvas.getBoundingClientRect(); p = e.clientX-r.left; };
}

// --- Shop Logic ---
const shopItems = {
    tanks: [{ id: 'heavy_tank', name: 'Heavy Tank', price: 500, icon: '🚜' }, { id: 'laser_tank', name: 'Laser Tank', price: 1500, icon: '🔫' }],
    skins: [{ id: 'gold_skin', name: 'Gold Armor', price: 1000, icon: '✨' }, { id: 'camo_skin', name: 'Camo Green', price: 300, icon: '🌿' }],
    boosts: [{ id: 'extra_life', name: 'Extra Life', price: 100, icon: '❤️' }, { id: 'speed_boost', name: 'Nitro', price: 200, icon: '⚡' }]
};
let currentShopTab = 'tanks';
window.showGameShop = function() { document.getElementById('shop-modal').style.display = 'flex'; renderShopItems(); };
window.closeShop = function() { document.getElementById('shop-modal').style.display = 'none'; };
window.switchShopTab = function(tab) { currentShopTab = tab; document.querySelectorAll('.shop-tab').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); renderShopItems(); };
function renderShopItems() {
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = shopItems[currentShopTab].map(item => `
        <div class="shop-item">
            <div class="item-preview">${item.icon}</div><div class="item-name">${item.name}</div><div class="item-price">${item.price} Coins</div>
            <button onclick="buyItem('${item.id}', ${item.price})" class="buy-btn ${ownedItems.includes(item.id) ? 'owned' : ''}">${ownedItems.includes(item.id) ? 'SỞ HỮU' : 'MUA'}</button>
        </div>
    `).join('');
}
window.buyItem = function(id, price) {
    if (tripCoins >= price && !ownedItems.includes(id)) { tripCoins -= price; ownedItems.push(id); saveGameData(); renderShopItems(); }
    else if(ownedItems.includes(id)) alert('Đã sở hữu!'); else alert('Không đủ coins!');
};
