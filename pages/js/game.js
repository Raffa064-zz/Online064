//Server connection setup
const socket = io.connect({ query: { nick: getUrlParam('nick') } })
socket.on('update', update)

//Frontend setup
const playerDataNick = document.querySelector('#player-nick')
const playerDataScore = document.querySelector('#player-score')
const bestPlayerData = document.querySelector('#bp-data')
const bestPlayerNick = document.querySelector('#bp-nick')
const bestPlayerScore = document.querySelector('#bp-score')
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const width = canvas.width
const height = canvas.height

//Game variables
var gameState = {}
var fruitBlinkState = 0

//Setup keyboard controls
document.addEventListener('keydown', event => {
    var direction = null
    if (event.key == 'ArrowUp') direction = 'up'
    if (event.key == 'ArrowDown') direction = 'down'
    if (event.key == 'ArrowLeft') direction = 'left'
    if (event.key == 'ArrowRight') direction = 'right'
    move(direction)
})

setInterval(render, 1000/120)

function getUrlParam(paramName) {
    var bruteStr = location.search.substring(1, location.search.length) //remove the "?" from the start of the query
    var params = bruteStr.split('&') //list of params
    for (const index in params) {
        if (params[index].split("=")[0] === paramName) {
            return params[index].split("=")[1]
        }
    }
}

function update(data) {
    gameState = data.gameState
    updateBestPlayer()
    updatePlayerData(data.updateTrigger)
}

function updateBestPlayer() {
    if (gameState.bestPlayer) {
        bestPlayerData.style.opacity = "100%"
        bestPlayerNick.innerText = gameState.bestPlayer.nick
        bestPlayerNick.style.color = gameState.bestPlayer.color
        bestPlayerScore.innerText = gameState.bestPlayer.score
    }
}

function updatePlayerData(updateTrigger) {
    if (updateTrigger) {
        if (updateTrigger.id === socket.id) {
            playerDataNick.innerText = 'Nick: ' + updateTrigger.nick
            playerDataScore.innerText = 'Score: ' + updateTrigger.score
        }
    }
}

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
            ctx.strokeStyle = "#000"
            ctx.strokeRect(player.x * cellWidth, player.y * cellHeight, cellWidth, cellHeight)
            ctx.fillRect(player.x * cellWidth, player.y * cellHeight, cellWidth, cellHeight)
        } else {
            ctx.strokeRect(player.x * cellWidth, player.y * cellHeight, cellWidth, cellHeight)
        }
    }

    for (const index in gameState.fruits) {
        const fruit = gameState.fruits[index]
        ctx.fillStyle = (fruitBlinkState + index % 5) % 10 < 5 ? '#f00' : '#fa0' //It ill apply blink effect on fruits
        ctx.fillRect(
            fruit.x * cellWidth + (cellWidth / 4),
            fruit.y * cellHeight + (cellHeight / 4),
            cellWidth / 2,
            cellHeight / 2
        )
    }

    fruitBlinkState++
}

//Sent the player movement for the server
function move(direction) {
    socket.emit('move', direction)
}