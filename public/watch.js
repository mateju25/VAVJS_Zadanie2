// Matej Delincak

window.onbeforeunload = function(){
    clearInterval(gmLoop);
    fetch('/destroy').then();
}

let speed = 512;
let gmLoop;
let number = document.getElementById('labelId').innerText;

let canvas = document.getElementById('canvasId');
canvas.setAttribute('width', SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH);
canvas.setAttribute('height', SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH);
drawSpace();

function gameLoop() {
    gmLoop = setInterval(function () {
        fetch('/watchGame?number=' + number).then(data => data.json()).then(data => {
            drawSpace();
            if (data.aliens !== undefined) {
                drawAliens(data.aliens);
                drawShip(data.ship);
                drawMissiles(data.missiles);
                speed = data.speed / 2;
                if (data.state === 'win')
                    win();
                if (data.state === 'loose')
                    loose();
            }
        });

    },speed);
}

gameLoop();