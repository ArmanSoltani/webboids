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
                this.buckets[x][y] = {sum_vel: createVector(0, 0), pos_mean: createVector(0, 0), boids: new Set(), total: 0, food: null}
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
                let pos_mean = createVector(0, 0)
                let vel_mean = createVector(0, 0)
                const n = this.buckets[x][y]["boids"].size
                this.buckets[x][y]["boids"].forEach(boid => {
                    pos_mean.add(boid.position)
                    vel_mean.add(boid.velocity)
                })
                if (n !== 0) {
                    pos_mean.div(n)
                    vel_mean.div(n)
                }
                this.buckets[x][y].pos_mean = pos_mean
                this.buckets[x][y].vel_mean = vel_mean
                this.buckets[x][y].total = n

                if (this.buckets[x][y].food === null && Math.random() < this.config.food_proba) {
                    this.buckets[x][y].food = {
                        pos: createVector(
                            (x + Math.random()) * this.config.bucket_size,
                            (y + Math.random()) * this.config.bucket_size),
                        nb: ceil(Math.random() * 15)
                    }
                }

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
        // this.draw_buckets()
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
        strokeWeight(0)
        for (let x=0; x<this.buckets.length; x++) {
            for (let y=0; y<this.buckets[0].length; y++) {
                const nb_boid_in_bucket = this.buckets[x][y].size
                fill(255 * 10 * nb_boid_in_bucket / this.config.nb_boids, 0, 0)
                rect(x * this.config.bucket_size, y * this.config.bucket_size, this.config.bucket_size, this.config.bucket_size);
            }
        }

        strokeWeight(0.25)
        stroke(200)
        for (let x=0; x<this.buckets.length; x++) {
            line(x * this.config.bucket_size + this.config.bucket_size, 0, x * this.config.bucket_size + this.config.bucket_size, this.config.canvas_height)
        }
        for (let y=0; y<this.buckets[0].length; y++) {
            line(0, y * this.config.bucket_size + this.config.bucket_size, this.config.canvas_wight, y * this.config.bucket_size + this.config.bucket_size)
        }
    }

    draw_vel_field() {
        fill(200)
        stroke(200, 0, 0)
        strokeWeight(3)
        for (let x=0; x<this.buckets.length; x++) {
            for (let y=0; y<this.buckets[0].length; y++) {
                const start_x = x * this.config.bucket_size + this.config.bucket_size / 2
                const start_y = y * this.config.bucket_size + this.config.bucket_size / 2
                line(start_x, start_y, start_x + this.buckets[x][y].sum_vel.x * 10, start_y + this.buckets[x][y].sum_vel.y * 10)
            }
        }
    }

}