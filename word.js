class Word {
    constructor(config) {
        this.config = config
        this.buckets = []
        this.boids = []
    }

    reset() {
        background(10, 10, 10)

        this.buckets = []
        for (let i=0; i<Math.ceil(this.config.canvas_wight / this.config.bucket_size); i++)
            this.buckets.push(new Array(Math.ceil(this.config.canvas_height / this.config.bucket_size)))
        for (let x=0; x<this.buckets.length; x++) {
            for (let y = 0; y < this.buckets[0].length; y++) {
                this.buckets[x][y] = new Bucket(x, y, this.config.bucket_size, this.config.bucket_size, this.config)
            }
        }

        const color1 = color(255, 179, 163)
        const color2 = color(169, 180, 214)

        this.boids = []
        this.boids.push(new Boid(createVector(random(this.config.canvas_wight), random(this.config.canvas_height)),
            p5.Vector.random2D().setMag(random(2, 4)),
            10,
            true,
            lerpColor(color1, color2, random()),
            this.config,
            this.buckets))
        for (let i=0; i<this.config.nb_boids; i++)
            this.boids.push(new Boid(createVector(random(this.config.canvas_wight), random(this.config.canvas_height)),
                p5.Vector.random2D().setMag(random(2, 4)),
                10,
                false,
                lerpColor(color1, color2, random()),
                this.config,
                this.buckets))
    }

    update() {
        for (let x=0; x<this.buckets.length; x++) {
            for (let y=0; y<this.buckets[0].length; y++) {
                this.buckets[x][y].update()
            }
        }

        this.boids.forEach(boid => {
            boid.get_buckets()
            // boid.draw_buckets()
            // boid.draw_vel()
            // boid.draw_acc()
            boid.update()
        })
    }

    draw() {
        this.boids.forEach(boid => {
            boid.move()
            boid.draw("line")
            // boid.draw_influences()
            // boid.draw_separation()
            // boid.draw_coherence()
            // boid.draw_alignment()
        })

        // this.draw_food()
        this.draw_buckets()
        // this.draw_vel_field()
    }

    draw_food() {
        for (let x=0; x<this.buckets.length; x++) {
            for (let y = 0; y < this.buckets[0].length; y++) {
                const bucket = this.buckets[x][y]
                if (bucket.food !== null) {
                    strokeWeight(bucket.food.nb)
                    stroke(255, 255, 0)
                    point(bucket.food.pos.x, bucket.food.pos.y)
                }
            }
        }
    }

    draw_buckets() {
        for (let x=0; x<this.buckets.length; x++) {
            for (let y=0; y<this.buckets[0].length; y++)
                this.buckets[x][y].draw()
        }
    }
}