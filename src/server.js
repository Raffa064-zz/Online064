//Carregar bibliotecas/modulos
const express = require('express') //Carrega o express
const http = require('http') //Carrega o http (biblioteca padrão)
const socketIo = require('socket.io') //Carrega socket.io
const game = require('./game') //Carrega o modulo game.js

//Setup
const app = express() //Cria a aplicaçãp
const server = http.createServer(app) //Cria um servidor
const io = socketIo().listen(server) //Inicia o socket.io como ouvinte do servidor

app.use(express.static(page())) //Seleciona a pasta pages como provedor de paginas estaticas

//Selecionar e iniciar servidor
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log('Server started on port: ' + PORT))

//Constantes e variaveis de ambiente
const SPAWN_DELAY = process.env.SPAWN_DELAY || 1000
const MIN_FRUITS = process.env.MIN_FRUITS || 10
const MAX_FRUITS = process.env.MAX_FRUITS || 20
const playerMovements = {
    up: player => (player.y--),
    down: player => (player.y++),
    left: player => (player.x--),
    right: player => (player.x++)
}

const gameState = game.createGameState(32, 32)

io.on('connection', socket => {
    console.log('Player connected!')

    const nick = validNick(socket.handshake.query.nick)
    const player = gameState.spawnPlayer(socket.id, nick)

    //Evento de quando o player se move 
    socket.on('move', (direction) => {
        const movement = playerMovements[direction]
        if (movement) {
            movement(player)
        }

        //Colisão nas paredes
        player.x = Math.max(0, Math.min(gameState.width - 1, player.x))
        player.y = Math.max(0, Math.min(gameState.height - 1, player.y))

        //Detectar e processar colisões do player com as frutas
        gameState.checkFruitsCollision(player, () => {
            //60% de chance de spawnar uma fruta imediatamente
            spawnFruitRandomPercentage(0.6)
        })
        
        //Atualizar melhor jogador (caso necesario)
        gameState.updateBestPlayer(player)

        //Mandar alterações para todos os jogadores 
        update()
    })

    //Evento de quando player disconecta
    socket.on('disconnect', () => {
        console.log('Player disconnected')
        gameState.removePlayer(player)
        update()
    })

    update()
})

setInterval(spawnFruitAndUpdate, SPAWN_DELAY) //spawnar uma fruta a cada tantos segundos

//Função responsavel por filtrar os nick dos usuarios. Caso o nick sej nulo ou invalido, retorna uma string aleatoria 
function validNick(nick) {
    //Verificar regras do nick, 4 a 20 caracteres, e com apenas letras, numeros e underline.
    const validNickRegex = /^[a-zA-Z0-9_]{4,20}$/
    if (nick.match(validNickRegex)) {
        return nick
    }

    //Gerar nick aleatorio
    availableChars = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz0123456789'.split('')
    nick = ''
    for (let i = 0; i < 10; i++) {
        nick += availableChars[parseInt(Math.random() * availableChars.length)]
    }

    return nick;
}

//Envia o gameState atual para todos os usuarios
function update() {
    io.emit('update', gameState.publicState())
}

//Função que spawn frutas... o numero maximo de frutas spawnadas simultaneamente é de 10 frutas
function spawnFruit() {
    //Spawna ate 'MAX_FRUITS' frutas, nunca pode ter mais fruta do que player, e o minimo de frutas seria 'MIN_FRUITS'.
    if (gameState.fruits.length < MAX_FRUITS && gameState.fruits.length < Math.max(MIN_FRUITS, gameState.players.length)) {
        gameState.spawnFruit()
        console.log('Spawned a fruit!')
    }
}

function spawnFruitAndUpdate() {
    spawnFruit()
    update()
}

function spawnFruitRandomPercentage(percent) {
    if (Math.random() < percent) {
        spawnFruit()
    }
}

function page(pageName) {
    //Esta função retorna o path de uma pagina da pasta pages. 
    //Quando o prametro pageName é nulo, ela retorna apenas o path da pasta pages

    const parentDirName = __dirname.substring(0, __dirname.length - '/src'.length) //Remove "/src" 
    var path = parentDirName + '/pages/'
    if (pageName) {
        path += pageName
    }
    return path
}