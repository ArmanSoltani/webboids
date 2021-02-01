/**
 * Un Bucket représente une partie de l'espace de la simulation
 */
class Bucket {
    constructor(x, y, widht, height, config) {
        this.config = config

        // Position et taille en pixel du bucket
        this.x = x
        this.y = y
        this.widht = widht
        this.height = height

        // Vélocité moyenne des boids du bucket
        this.velocity_mean = createVector()
        // Position moyenne des boids du bucket
        this.position_mean = createVector()

        // Set contenant l'ensemble des boids contenuent dans ce bucket
        this.boids = new Set()

        // Si le bucket contient de la nourriture sont attribut food sera un objet
        // de type {position, quantité de nourriture disponible}
        this.food = null
    }

    /**
     * Update les attributs du bucket et génére la nourriture
     */
    update() {
        // Agrégation des position et vélocité des boids du bucket
        this.position_mean = createVector()
        this.velocity_mean = createVector()
        const n = this.boids.size
        this.boids.forEach(boid => {
            this.position_mean.add(boid.position)
            this.velocity_mean.add(boid.velocity)
        })
        if (n !== 0) {
            this.position_mean.div(n)
            this.velocity_mean.div(n)
        }

        // Si le bucket ne continent pas de nourriture alors on en crée avec une probabilité de config.food_proba
        if (this.food === null && Math.random() < this.config.food_proba) {
            this.food = {
                // La position de la source de nourriture
                position: createVector(
                    this.x + Math.random() * this.widht,
                    this.y + Math.random() * this.height),
                // La quantité de nourriture présente
                quantity: ceil(Math.random() * this.config.max_food_quantity)
            }
        }
    }

    /**
     * DEBUG Affiche les contours du bucket à l'écran
     */
    draw() {
        fill(0, 0, 0, 0)
        strokeWeight(0.25)
        stroke(200)
        rect(this.x, this.y, this.widht, this.height)
    }

    /**
     * DEBUG Affiche la source de nourriture du bucket
     */
    draw_food() {
        if (this.food !== null) {
            strokeWeight(this.food.quantity)
            stroke(255, 255, 0)
            point(this.food.position.x, this.food.position.y)
        }
    }
}