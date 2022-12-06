const input = document.querySelector('#nick')

function checkValidNick() {
    var regex = /^[a-zA-Z0-9_]{4,20}$/
    if (input.value.match(regex)) {
        if (input.classList.contains('error')) {
            input.classList.remove('error')
        }
    } else {
        if (!input.classList.contains('error')) {
            input.classList.add('error')
        }
    }
}

function play() {
    window.location.replace("game.html?nick=" + input.value)
}