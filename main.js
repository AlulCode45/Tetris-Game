// Akses kanvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const gameStats = sessionStorage.getItem('game_stats')

ctx.scale(19, 19)


// Data Pemain
const player = {
    pos: { x: 4, y: 0 },
    matrix: null,
    score: 0,
}


// Modifikasi Permainan
let cleared = 0
let winReq = 150
let constantScoreMult = 3
let scoreSmallMod = 25
let smallModIncrease = 5

// Membuat Tempat Menyimpan
const pieces = "ILJOTSZ"
let hold = createBlocks(pieces[pieces.length * Math.random() | 0]);

// Potongan-potongan
function createBlocks(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2]
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    } else if (type === 'Z') {
        return [
            [0, 0, 0],
            [6, 6, 0],
            [0, 6, 6]
        ];
    } else if (type === "S") {
        return [
            [0, 0, 0],
            [0, 7, 7],
            [7, 7, 0]
        ];
    };
};

// Logika Tabrakan
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Warna untuk Tetromino
const colors = [
    null,
    "#ffaaff",
    "#aaffff",
    "#ffaaaa",
    "#9999ff",
    "#aaaaff",
    "#aaffaa",
    "#ffdddd"
]

// Pembuat Arena
function createMatrix(h, w) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    };
    return matrix;
};

// Menggabungkan Matrix Pemain dan Arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    })
}

// RNG yang Dibulatkan
function roundRandom() {
    let rng = Math.random()
    if (rng > 0.49) {
        return 1
    } else {
        return 0
    }
}



// Pembersihan
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        // console.log(`y: ${y}`)
        for (let x = 0; x < arena[y].length; ++x) {
            // console.log(`x: ${x}`)
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += 10

        // rowCount *= (constantScoreMult + roundRandom());
        // player.score += scoreSmallMod
        // scoreSmallMod += smallModIncrease
        ++cleared
        updateScore();


        if (cleared > (winReq - 1)) {
            arena.forEach(row => row.fill(0));
            alert('Player Menang')
            player.score = 0;
            playerReset();
            return;
        }
    }
}

// Menggambar Segalanya
function draw() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 240, 400)
    drawMatrix(arena, { x: 0, y: 0 })
    drawMatrix(player.matrix, player.pos)
}

// Menggambar Potongan yang Dikendalikan/Arena/Hold
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {

                ctx.shadowColor = colors[value];
                ctx.shadowBlur = 17;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                ctx.fillStyle = '#000000';
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x + 0.1,
                    y + offset.y + 0.1,
                    0.8, 0.8);
            };
        });
    });
};

// Lapangan Permainan
let arena = createMatrix(20, 12);
// console.table(arena);

// Variabel Waktu
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;


// Pergerakan Pemain
function playerMove(dir) {
    player.pos.x = player.pos.x + dir
    if (collide(arena, player)) {
        player.pos.x = player.pos.x + (dir * -1)
    }
}

// Rotasi & Pengecekan
function rotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rot(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rot(player.matrix, dir * -1);
            player.pos.x = pos;
            return;
        }
    }
}

// Rotasi
function rot(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ]
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Mengubah Potongan
function playerReset() {
    player.matrix = createBlocks(pieces[pieces.length * Math.random() | 0])
    player.pos.y = 0
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0))

        alert('Game Over')

        player.score = 0
        scoreSmallMod = 0
        cleared = 0
        updateScore()
    }
}

// Fungsi Melempar
function drop() {
    player.pos.y++
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

// Fungsi Dasar Pembaruan
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter = dropCounter + deltaTime
    if (dropCounter > dropInterval) {
        drop()
    }
    draw();
    requestAnimationFrame(update);
}

// Memperbarui Skor
function updateScore() {

    let highestScores = JSON.parse(localStorage.getItem('highest_scores')) || [];

    // if (player.score > highestScores) {
    const newEntry = { gameStats: gameStats, score: player.score };
    highestScores.push(newEntry);
    localStorage.setItem('highest_scores', JSON.stringify(highestScores));
    // }

    document.getElementById("score").innerText = `Score: ${player.score} / Lines: ${cleared}`
}

// Fungsionalitas
document.addEventListener('keydown', event => {
    if (event.key === "ArrowLeft") {
        playerMove(-1)
    } else if (event.key === "ArrowRight") {
        playerMove(1)
    } else if (event.key === "ArrowDown") {
        drop()
    } else if (event.key === " ") {
        while (!collide(arena, player)) {
            ++player.pos.y
        }
        --player.pos.y
        drop()
    } else if (event.key === "ArrowUp") {
        rotate(1)
    } else if (event.key === "q") {
        rotate(1)
    } else if (event.key === "e") {
        rotate(-1)
    } else if (event.key === "Control") {
        rotate(-1)
    } else if (event.key === "Alt") {
        rotate(2)
    }
});
playerReset();
updateScore();
update();