//Conexão com servidor
const socket = io.connect()
var gameState = {}
socket.on('update', (state) => {
    gameState = state
})

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
        ctx.fillStyle = player.id === socket.id ? '#f00' : '#000'
        ctx.fillRect(player.x * cellWidth, player.y * cellHeight, cellWidth, cellHeight)
    }
}