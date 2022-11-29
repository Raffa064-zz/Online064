//Conexão com servidor
const socket = io.connect()
var gameState = {}
socket.on('update', (state) => {
    gameState = state
})

//Controles
document.addEventListener('keydown', event => {
    var key = null
    if (event.key == 'ArrowUp') key = 'up'
    if (event.key == 'ArrowDown') key = 'down'
    if (event.key == 'ArrowLeft') key = 'left'
    if (event.key == 'ArrowRight') key = 'right'
    console.log(event.key)
    socket.emit('move', key)
})

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