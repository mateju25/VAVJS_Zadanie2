// Matej Delincak

window.onbeforeunload = function(){
    fetch('/destroy').then();
}

const socket = new WebSocket('ws://localhost:8082');
let number;
let speed = 1024;
let gmLoop;

fetch("/number").then(data => data.json()).then(data => {
    number = JSON.parse(data);

    fetch('/watchGame?number=' + number).then(data => data.json()).then(data => {
        console.log(data.state);
        if (data.state === 'running')
            document.getElementById('btnStart').click();
    });

    let canvas = document.getElementById('canvasId');
    canvas.setAttribute('width', SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH);
    canvas.setAttribute('height', SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH);
    drawSpace();

    document.getElementById('number').innerHTML = "Game number: " + number;

    fetch("/pin?number="+number).then(data => data.json()).then(data => {
        document.getElementById('pin').innerHTML = 'Pin: ' + JSON.parse(data);
    });

    fetch("/maxScore?number="+number).then(data => data.json()).then(data => {
        document.getElementById('maxScore').innerHTML = 'Max score: ' + JSON.parse(data);
    });

    fetch("/maxLevel?number="+number).then(data => data.json()).then(data => {
        document.getElementById('maxLevel').innerHTML = 'Max level: ' + JSON.parse(data);
    });
});

document['onkeydown'] = function (e) {
    let params = {};
    params["number"] = number;
    params["key"] = (e || window.event).keyCode;
    loadJson('/key', params)
}

document.getElementById('btnMusic').addEventListener("click", () => {
    if (audio.paused) {
        audio.volume = 0.5;
        audio.loop = true;
        audio.play();
        document.getElementById('btnMusic').innerHTML = "Stop music";
    } else {
        audio.pause();
        document.getElementById('btnMusic').innerHTML = "Play music";
    }
});

document.getElementById('btnStart').addEventListener("click", () => {
    clearInterval(gmLoop);
    gameLoop();
});

document.getElementById('btnReset').addEventListener("click", () => {
    clearInterval(gmLoop);
    let params = {};
    params["number"] = number;
    loadJson('/resetGame', params)
    drawSpace();
});



socket.addEventListener('message', function (event){
    let data = JSON.parse(event.data);
    document.getElementById('levelId').innerHTML = 'Level: ' + data.level + '     ';
    document.getElementById('maxLevel').innerHTML = 'Max level: ' + data.maxLevel + '     ';
    document.getElementById('scoreId').innerHTML = 'Score: ' + data.score + '     ';
    document.getElementById('maxScore').innerHTML = 'Max score: ' + data.maxScore + '     ';
    document.getElementById('speedId').innerHTML = 'Speed: ' + data.speed + '     ';
    drawSpace();
    drawAliens(data.aliens);
    drawShip(data.ship);
    drawMissiles(data.missiles);
    speed = data.speed;
    if (data.state === 'win') {
        clearInterval(gmLoop);
        win();
        setTimeout(function(){
            gameLoop();
        },1000);
    }
    if (data.state === 'loose') {
        clearInterval(gmLoop);
        loose();
    }
});

function gameLoop() {
    gmLoop = setInterval(function () {
        socket.send(JSON.stringify({"number":number}));
    },speed);
}
