let config
let word

/**
 * Fonction d'initialisation de la simulation - appelée une seule fois au chargement de la page
 */
function setup() {
    // creation de l'objet Config qui se charge de la gestion des paramétres
    config = new Config()
    config.setup(reset)

    word = new Word(config)

    createCanvas(config.canvas_wight, config.canvas_height)

    reset()
    background(10)
}

function reset() {
    // reset la simulation a t = 0
    word.reset()
}


function draw() {
    background(10, 10, 10, 5)
    // background(10)

    // update la simulation d'une frame
    word.update()
    // dessine l'état courant de la simulation
    word.draw()

    draw_framerate()
}

/**
 * Affiche le framerate en haut a gauche du camvas
 */
function draw_framerate() {
    stroke(200)
    fill(10)
    rect(0, 0, 100, 40)
    textSize(20)
    stroke(200)
    fill(200)
    strokeWeight(1)
    text(round(frameRate(), 2), 25, 25)
}

function windowResized() {
    setup()
}
