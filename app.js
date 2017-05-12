const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(21, 20);

const matrix = [
	[0, 0, 0],
	[1, 1, 1],
	[0, 1, 0]
];

function createMatrix (width, height) {
	const matrix = [];

	while (height--)  // height not zero
		matrix.push(new Array(width).fill(0));

	return matrix;
}

function draw () {
	context.fillStyle = '#000'; // Black
	context.fillRect(0, 0, canvas.width, canvas.height);
	drawMatrix(arena, {x: 0, y: 0});
	drawMatrix(player.matrix, player.position);
}

function playerRotate (direction) {
	const position = player.position.x;
	let offset = 1;

	rotate(player.matrix, direction);

	while (isCollide(arena, player)) {
		player.position.x = offset;
		offset = -(offset + (offset > 0 ? 1 : -1));

		if (offset > player.matrix[0].length) {
			rotate(player.matrix, -dir);
			player.position.x = position;
			return;
		}
	}
}

function createPiece (type) {
	if (type == 'T') {
		return [
			[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0]
		];
	} else if (type == 'L') {
		return [
			[0, 2, 0],
			[0, 2, 0],
			[0, 2, 2]
		];
	} else if (type == 'J') {
		return [
			[0, 3, 0],
			[0, 3, 0],
			[3, 3, 0]
		];
	} else if (type == 'O') {
		return [
			[4, 4],
			[4, 4]
		];
	} else if (type == 'S') {
		return [
			[0, 5, 5],
			[5, 5, 0],
			[0, 0, 0]
		];
	} else if (type == 'Z') {
		return [
			[6, 6, 0],
			[0, 6, 6],
			[0, 0, 0]
		];
	} else if (type == 'I') {
		return [
			[0, 7, 0, 0],
			[0, 7, 0, 0],
			[0, 7, 0, 0],
			[0, 7, 0, 0]
		];
	}
}

function rotate (matrix, direction) {
	for (let y = 0; y < matrix.length; ++y) {
		for (let x = 0; x < y; ++x) {
			// Swap matrix
			[
				matrix[x][y],
				matrix[y][x]
			] = [
				matrix[y][x],
				matrix[x][y]
			]
		}
	}

	if (direction > 0) {
		matrix.forEach((row) => {
			row.reverse()
		});
	} else {
		matrix.reverse();
	}

}
function drawMatrix (matrix, offset) {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value) {
				context.fillStyle = colors[value]; // Red
				context.fillRect(
					x + offset.x, 
					y + offset.y, 
					1, 
					1
				);
			}
		});
	});
}

let dropCounter = 0;
let dropInterval = 1000; // drop matrix every 1 second
let lastTime = 0;

function update (time = 0) {
	const deltaTime = time - lastTime;
	lastTime = time;
	dropCounter += deltaTime;

	if (dropCounter > dropInterval) 
		playerDrop();

	draw();
	requestAnimationFrame(update);
}

function merge (arena, player) {
	console.log(player);
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value) 
				arena[y + player.position.y][x + player.position.x] = value;
		});
	});
}

function isCollide (arena, player) {
	const [matrix , offset] = [player.matrix, player.position];
	for (let y = 0; y < matrix.length; ++y) {
		for (let x = 0; x < matrix[y].length; ++x) {
			let hasRow = matrix[y][x] !== 0 && (arena[y + offset.y] && arena[y + offset.y][x + offset.x]) !== 0;
			if (hasRow) 
				return true;
		}
	}

	return false;
}

function playerDrop () {
	player.position.y++;
	if (isCollide(arena, player)) {
		player.position.y--;
		merge(arena, player);
		playerReset();
		//debugger;
		arenaSweep();
		updateScore();
	}
	dropCounter = 0;
}

function playerLeft () {
	player.position.x--;
}

function playerMove (direction) {
	player.position.x += direction;

	if (isCollide(arena, player)) {
		player.position.x -= direction;
	}
}

function playerRight () {
	player.position.x++;
}

function updateScore () {
	document.getElementById('score').innerText = player.score;
}

function playerReset () {
	const pieces = 'ILJOSZT';
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
	player.position.y = 0;
	player.position.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

	if (isCollide(arena, player)) {
		arena.forEach((row) => {
			row.fill(0);
		});
		player.score = 0;
		updateScore();
	}
}

function arenaSweep () {
	let rowCount = 1;
	outer: for (let y = arena.length - 1; y > 0; --y) {
		for (let x = 0; x < arena[y].length; ++x) {
			if (arena[y][x] === 0) {
				continue outer;
			}
		}

		const row = arena.splice(y, 1)[0].fill(0);
		arena.unshift(row);
		++y;

		player.score += rowCount * 10;
		rowCount *= 2;
	}
}

const colors = [
	null,
	'red',
	'green',
	'blue',
	'yellow',
	'purple',
	'pink',
	'orange'
];

const arena = createMatrix(12, 20); // width, height
// console.log(arena);
// console.table(arena);
const player = {
	position: {
		x: 0,
		y: 0
	},
	matrix: null,
	score: 0
};

document.addEventListener('keydown', (e) => {
	switch (e.keyCode) {
		case 37:
			playerMove(-1);
			break;
		case 39:
			playerMove(1);
			break;
		case 40:
			playerDrop();
			break;
		case 81:
			playerRotate(-1);
			break;
		case 87:
			playerRotate(1);
			break;
		default:
			break;
	}
});

playerReset();
updateScore();
update();
