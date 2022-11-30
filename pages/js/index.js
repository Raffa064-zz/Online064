function play() {
    const input = document.querySelector('#nick')
    window.location.replace("game.html?nick=" + input.value)
}