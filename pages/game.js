const nickStr = getUrlParam('nick')

//Conexão com servidor
const socket = io.connect()
var gameState = {}
socket.on('update', (state) => {
    gameState = state
})
socket.emit('change-nick', nickStr)


//Controles
document.addEventListener('keydown', event => {
    var direction = null
    if (event.key == 'ArrowUp') direction = 'up'
    if (event.key == 'ArrowDown') direction = 'down'
    if (event.key == 'ArrowLeft') direction = 'left'
    if (event.key == 'ArrowRight') direction = 'right'
    move(direction)
})

function move(direction) {
    socket.emit('move', direction)
}

//Setup do frontend
const nick = document.querySelector('#nick')
const score = document.querySelector('#score')
const canvas = document.querySelector('canvas')
const width = canvas.width
const height = canvas.height
const ctx = canvas.getContext('2d')

setInterval(render, 1000 / 64)

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
            ctx.fillRect(player.x * cellWidth, player.y * cellHeight, cellWidth, cellHeight)
        } else {
            ctx.strokeRect(player.x * cellWidth, player.y * cellHeight, cellWidth, cellHeight)
        }
    }
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