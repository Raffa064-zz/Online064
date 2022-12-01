//Controles
document.addEventListener('keydown', event => {
    var direction = null
    if (event.key == 'ArrowUp') direction = 'up'
    if (event.key == 'ArrowDown') direction = 'down'
    if (event.key == 'ArrowLeft') direction = 'left'
    if (event.key == 'ArrowRight') direction = 'right'
    move(direction)
})


//Setup do frontend
const nick = document.querySelector('#nick')
const score = document.querySelector('#score')
const bestPlayerData = document.querySelector('#bp-data')
const bestPlayerNick = document.querySelector('#bp-nick')
const bestPlayerScore = document.querySelector('#bp-score')
const canvas = document.querySelector('canvas')
const width = canvas.width
const height = canvas.height
const ctx = canvas.getContext('2d')
var fruitBlinkState = 0

//Conexão com servidor
const socket = io.connect({
    query: {
        nick: getUrlParam('nick')
    }
})
var gameState = {}
socket.on('update', (state) => {
    gameState = state
    if (gameState.bestPlayer) {
        bestPlayerData.style.opacity = "100%"
        bestPlayerNick.innerText = gameState.bestPlayer.nick
        bestPlayerNick.style.color = gameState.bestPlayer.color
        bestPlayerScore.innerText = gameState.bestPlayer.score
    }
})

setInterval(render, 1000/120)

function render() {
    const cellWidth = width / gameState.width
    const cellHeight = height / gameState.height
    ctx.clearRect(0, 0, width, height)
    for (const index in gameState.players) {
        const player = gameState.players[index]
        const color = player.color || '#ff0'
        ctx.strokeStyle = color
        ctx.fillStyle = color
        if (player.id === socket.id) {
            score.innerText = 'Score: ' + player.score
            nick.innerText = 'Nick: ' + player.nick
            ctx.strokeStyle = "#000"
            ctx.strokeRect(player.x * cellWidth, player.y * cellHeight, cellWidth, cellHeight)
            ctx.fillRect(player.x * cellWidth, player.y * cellHeight, cellWidth, cellHeight)
        } else {
            ctx.strokeRect(player.x * cellWidth, player.y * cellHeight, cellWidth, cellHeight)
        }
    }

    for (const index in gameState.fruits) {
        const fruit = gameState.fruits[index]
        ctx.fillStyle = (fruitBlinkState + index % 5) % 10 < 5 ? '#f00' : '#fa0' //Isso vai aplicar efeito de piscar nas frutas, um pouco assincrono para não ficar estranho
        ctx.fillRect(
            fruit.x * cellWidth + (cellWidth / 4),
            fruit.y * cellHeight + (cellHeight / 4),
            cellWidth / 2,
            cellHeight / 2
        )
    }

    fruitBlinkState++
}

function getUrlParam(paramName) {
    var bruteStr = location.search.substring(1, location.search.length) //remove the "?" from the start of the query
    var params = bruteStr.split('&') //list of params
    for (const index in params) {
        if (params[index].split("=")[0] === paramName) {
            return params[index].split("=")[1]
        }
    }
}

function move(direction) {
    socket.emit('move', direction)
}