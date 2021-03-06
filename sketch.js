let config
let word

let fr = 25

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

    // Calcul du moving average du frameRate
    fr -= fr / 100
    fr += frameRate() / 100

    // update la simulation d'une frame puis affiche l'état courant
    word.update(fr)
    word.draw()

    draw_framerate()
    draw_boids_number()
}

/**
 * DEBUG Affiche le framerate en haut a gauche de la fenetre
 */
function draw_framerate() {
    stroke(200)
    fill(10)
    rect(0, 0, 100, 40)

    textSize(20)
    stroke(200)
    fill(200)
    strokeWeight(1)
    text(round(fr, 2), 25, 25)
}

/**
 * DEBUG Affiche le nombre de boid dans la simulation
 */
function draw_boids_number() {
    stroke(200)
    fill(10)
    rect(0, 40, 100, 40)

    textSize(20)
    stroke(200)
    fill(200)
    strokeWeight(1)
    text(word.boids.length, 25, 25 + 40)
}

/**
 * Fonction appelée automatiquement par P5 lorsque la fenetre du navigateur change de taille
 * Ici on relance une nouvelle simulation
 */
function windowResized() {
    setup()
}
