// Matej Delincak

function loadJson(url, params = {}) {
    let query = Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    url = url + "?" + query;
    fetch(url).then(data => data.json()).then(data => {
        if(Object.keys(data).length !== 0) {
            let element = document.createElement(data.tag);
            element.setAttribute('id', data.id);
            document.body.innerText = '';
            document.body.appendChild(element);
            data = data.innerTags;
            data.forEach(elem => {
                let smallElem = document.createElement(elem.tag);
                for (let key in elem) {
                    let value = elem[key];
                    if (key === 'tag')
                        continue;
                    if (key === 'innerText') {
                        smallElem.innerText = value;
                        continue;
                    }
                    smallElem.setAttribute(key, value);
                }
                element.appendChild(smallElem);
            });
        }
    })
}

loadJson('/init');

let audio = new Audio('http://free-loops.com/force-audio.php?id=8618'); //licencia http://free-loops.com/8618-melodic-dubstep-140.html
const SIZE_OF_BLOCK = 48;
const NUMBER_OF_BLOCKS = 11;
const LINE_WIDTH = 2;

const image_alien = new Image();
image_alien.src = "https://www.clipartmax.com/png/full/9-93760_cute-sunshine-clipart.png"; //licencia https://www.clipartmax.com/middle/m2i8K9G6G6K9A0b1_free-to-use-public-domain-space-clip-art-alien-spaceship-cartoon-png/
const image_missile = new Image();
image_missile.src = "https://www.clipartmax.com/png/full/31-317895_rocket-images-clip-art.png"; //licencia https://www.clipartmax.com/middle/m2i8i8m2H7Z5d3H7_rocket-clipart-missile-clipart/
const image_ship = new Image();
image_ship.src = "https://pixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com/image/648ecfa1ee4c757.png"; // licencia http://pixelartmaker.com/art/648ecfa1ee4c757
const image_background = new Image();
image_background.src = "https://wallpaperaccess.com/download/pixel-space-2513478"; // licencia https://wallpaperaccess.com/pixel-space



function putImage(img, x) {
    let canvas = document.getElementById('canvasId');
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.drawImage(img, 1.5 * LINE_WIDTH + (x % NUMBER_OF_BLOCKS) * SIZE_OF_BLOCK, 1.5 * LINE_WIDTH + Math.floor(x / NUMBER_OF_BLOCKS) * SIZE_OF_BLOCK, SIZE_OF_BLOCK - LINE_WIDTH, SIZE_OF_BLOCK - LINE_WIDTH)
    ctx.stroke();
}

function drawSpace() {
    let canvas = document.getElementById('canvasId');
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.drawImage(image_background, 0, 0, SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH, SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH);
    ctx.stroke();
}

function drawAliens(aliens) {
    for (let i = 0; i < aliens.length; i++) {
        putImage(image_alien, aliens[i]);
    }
}

function drawShip(ship) {
    for (let i = 0; i < ship.length; i++) {
        putImage(image_ship, ship[i]);
    }
}

function drawMissiles(missiles) {
    for (let i = 0; i < missiles.length; i++) {
        putImage(image_missile, missiles[i]);
    }
}

function loose() {
    let canvas = document.getElementById('canvasId');
    let ctx = canvas.getContext("2d");
    ctx.drawImage(image_background, 0, 0, SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH, SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH);
    ctx.font='100px Arial';
    ctx.fillStyle = "#ff0000";
    ctx.fillText("LOSS", SIZE_OF_BLOCK * NUMBER_OF_BLOCKS / 4, SIZE_OF_BLOCK * NUMBER_OF_BLOCKS / 2);
    ctx.stroke();
}

function win() {
    let canvas = document.getElementById('canvasId');
    let ctx = canvas.getContext("2d");
    ctx.drawImage(image_background, 0, 0, SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH, SIZE_OF_BLOCK * NUMBER_OF_BLOCKS + 2 * LINE_WIDTH);
    ctx.font='100px Arial';
    ctx.fillStyle = "#3dff00";
    ctx.fillText("WIN", SIZE_OF_BLOCK * NUMBER_OF_BLOCKS / 4 + 40, SIZE_OF_BLOCK * NUMBER_OF_BLOCKS / 2);
    ctx.stroke();
}