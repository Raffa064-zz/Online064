//Carregar bibliotecas/modulos
const express = require('express') //Carrega o express
const http = require('http') //Carrega o http (biblioteca padrão)
const socketIo = require('socket.io') //Carrega socket.io

//Setup
const app = express() //Cria a aplicaçãp
const server = http.createServer(app) //Cria um servidor
const io = socketIo().listen(server) //Inicia o socket.io como ouvinte do servidor

app.use(express.static(page())) //Seleciona a pasta pages como provedor de paginas estaticas

//Selecionar e iniciar servidor
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log('Server started on port: ' + PORT))

const gameState = {
    players: [],
    width: 64,
    height: 64
}

io.on('connection', socket => {
    console.log('Player connected!')
    
    const player = {
        id: socket.id,
        x: Math.floor(Math.random() * gameState.width),
        y: Math.floor(Math.random() * gameState.height)
    }
    gameState.players.push(player)
    
    socket.on('disconnect', () => {
        console.log('Player disconnected')
        gameState.players = gameState.players.filter(player => player.id !== socket.id)
        update()
    })
    
    socket.on('move', (direction) => {
        const movements = {
            up: () => (player.y--),
            down: () => (player.y++),
            left: () => (player.x--),
            right: () => (player.x++)
        }
        
        const playerMovement = movements[direction]
        if (playerMovement) {
            playerMovement()
        }
        
        player.x = Math.max(0, Math.min(gameState.width-1, player.x))
        player.y = Math.max(0, Math.min(gameState.height-1, player.y))
        
        update()
    })
    
    update()
})

function update() {
    io.emit('update', gameState)
}

function page(pageName) {
    //Esta função retorna o path de uma pagina da pasta pages. 
    //Quando o prametro pageName é nulo, ela retorna apenas o path da pasta pages

    var path = __dirname + '/pages/'
    if (pageName) {
        path += pageName
    }
    return path
}