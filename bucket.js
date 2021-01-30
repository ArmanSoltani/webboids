class Bucket {
    constructor(x, y, widht, height, config) {
        this.config = config

        this.x = x
        this.y = y
        this.widht = widht
        this.height = height

        this.vel_mean = createVector()
        this.pos_mean = createVector()
        this.boids = new Set()
        this.food = null
    }

    update() {
        this.pos_mean = createVector()
        this.vel_mean = createVector()
        const n = this.boids.size
        this.boids.forEach(boid => {
            this.pos_mean.add(boid.position)
            this.vel_mean.add(boid.velocity)
        })
        if (n !== 0) {
            this.pos_mean.div(n)
            this.vel_mean.div(n)
        }

        if (this.food === null && Math.random() < this.config.food_proba) {
            this.food = {
                pos: createVector(
                    this.x + Math.random() * this.widht,
                    this.y + Math.random() * this.height),
                nb: ceil(Math.random() * 15)
            }
        }
    }

    draw() {
        fill(0, 0, 0, 0)
        strokeWeight(0.25)
        stroke(200)
        rect(this.x, this.y, this.widht, this.height)
    }

}