let config
let word

/**
 * Fonction d'initialisation de la simulation - appelée une seule fois au chargement de la page
 */
function setup() {
    // creation de l'objet Config qui se charge de la gestion des paramétres
    config = new Config()

    // L'objet "Word" est responsable de la simulation
    word = new Word(config)

    createCanvas(windowWidth, windowHeight)
    reset()
}

/**
 * Reset la simulation la simulation à un t = 0 aléatoire
 */
function reset() {
    background(10, 10, 10)
    word.reset()
}

/**
 * Affiche l'état courant de la simulation
 * Appelée automatiquement par P5
 */
function draw() {
    background(10, 10, 10, 5)

    // update la simulation d'une frame puis affiche l'état courant
    word.update()
    word.draw()

    // draw_framerate()
}

/**
 * Affiche le framerate en haut a gauche de la fenetre
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

/**
 * Fonction appelée automatiquement par P5 lorsque la fenetre du navigateur change de taille
 * Ici on relance une nouvelle simulation
 */
function windowResized() {
    setup()
}
