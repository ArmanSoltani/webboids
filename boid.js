class Boid {
    constructor(pos, vel, length, follow, color, config, buckets) {
        this.color = color
        this.length = length

        this.position = pos
        this.velocity = vel
        this.acceleration = createVector(0, 0)

        this.prev_pos = pos.copy()

        this.config = config
        this.buckets = buckets
        this.bucket_x = int(this.position.x / config.bucket_size)
        this.bucket_y = int(this.position.y / config.bucket_size)
        this.buckets[this.bucket_x][this.bucket_y].add(this)

        this.neighbours = []
        this.buckets_to_check = new Set()

        this.follow = follow
    }

    draw(type="triangle") {
        if (type === "triangle") {
            strokeWeight(0)
            stroke(0)
            if (this.follow)
                fill(200, 100, 200)
            else {
                fill(250, 250, 250, 0)
                strokeWeight(1)
                stroke(250, 250, 250)
            }

            const dir1 = createVector(this.velocity.x, this.velocity.y).normalize()
            const dir2 = createVector(dir1.x, dir1.y).rotate(PI / 2)
            const x1 = this.position.x + dir1.x * this.length
            const y1 = this.position.y + dir1.y * this.length
            const x2 = this.position.x +  dir2.x * this.length / 3
            const y2 = this.position.y + dir2.y * this.length / 3
            const x3 = this.position.x - dir2.x * this.length / 3
            const y3 = this.position.y - dir2.y * this.length / 3

            triangle(x1, y1, x2, y2, x3, y3)
        }
        else if (type === "line") {
            strokeWeight(1)
            stroke(this.color)
            line(this.prev_pos.x, this.prev_pos.y, this.position.x, this.position.y)

            this.prev_pos = this.position.copy()
        }
    }

    move() {
        this.position.add(this.velocity)
        this.velocity.add(this.acceleration)

        this.velocity.limit(this.config.max_speed)
        this.acceleration.set(0, 0)

        this.mirror_pos()

        const new_bucket_x = int(this.position.x / this.config.bucket_size)
        const new_bucket_y = int(this.position.y / this.config.bucket_size)
        if (this.bucket_x !== new_bucket_x || this.bucket_y !== new_bucket_y) {
            this.buckets[this.bucket_x][this.bucket_y].delete(this)
            this.buckets[new_bucket_x][new_bucket_y].add(this)
            this.bucket_x = new_bucket_x
            this.bucket_y = new_bucket_y
        }
    }

    update() {
        this.align()
        this.cohesion()
        this.separation()

        this.acceleration.add(this.aligment_vec.mult(this.config.aligment_slider.value()))
        this.acceleration.add(this.cohesion_vec.mult(this.config.cohesion_slider.value()))
        this.acceleration.add(this.separation_vec.mult(this.config.separation_slider.value()))
    }

    mirror_pos() {
        if (this.position.x < 0) {
            this.position.x += this.config.canvas_wight
            this.prev_pos.x += this.config.canvas_wight
        }
        if (this.position.y < 0) {
            this.position.y += this.config.canvas_height
            this.prev_pos.y += this.config.canvas_height
        }
        if (this.position.x > this.config.canvas_wight) {
            this.position.x -= this.config.canvas_wight
            this.prev_pos.x -= this.config.canvas_wight
        }
        if (this.position.y > this.config.canvas_height) {
            this.position.y -= this.config.canvas_height
            this.prev_pos.y -= this.config.canvas_height
        }
    }

    draw_influences() {
        if (!this.follow)
            return

        strokeWeight(0.25)
        stroke(200)
        fill(0,0,0,0)
        circle(this.position.x, this.position.y, this.config.influence * 2)

        strokeWeight(1)
        stroke(0, 200, 0)
        this.neighbours.forEach(neighbour => {
            const boid = neighbour.boid
            line(this.position.x, this.position.y, boid.position.x, boid.position.y)
        })
    }

    draw_separation() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(0, 0, 250)
        line(this.position.x, this.position.y, this.position.x + this.separation_vec.x * 10, this.position.y + this.separation_vec.y * 10)
    }

    draw_coherence() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(0, 250, 0)
        line(this.position.x, this.position.y, this.position.x + this.cohesion_vec.x * 10, this.position.y + this.cohesion_vec.y * 10)
    }

    draw_alignment() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(250, 0, 0)
        line(this.position.x, this.position.y, this.position.x + this.aligment_vec.x * 10, this.position.y + this.aligment_vec.y * 10)
    }

    draw_vel() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(250, 0, 0)
        line(this.position.x, this.position.y, this.position.x + this.velocity.x * 30, this.position.y + this.velocity.y * 30)
    }

    draw_acc() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(0, 250, 0)
        line(this.position.x, this.position.y, this.position.x + this.acceleration.x * 30, this.position.y + this.acceleration.y * 30)
    }

    get_buckets() {
        const ray_angle = this.config.bucket_size / this.config.influence

        // if (this.follow) {
        //     stroke(0, 0, 250)
        //     fill(0, 0, 250)
        //     strokeWeight(1.5)
        //     for (let i=-field_of_view; i<=field_of_view + field_of_view % ray_angle; i += ray_angle) {
        //         const ray = this.vel.copy().normalize().rotate(i).mult(bucket_size)
        //         let ray_end = createVector(0, 0)
        //         for (let j=1; j*bucket_size <= influence + influence % bucket_size; j++) {
        //             ray_end.add(ray);
        //             line(this.pos.x, this.pos.y, this.pos.x + ray_end.x, this.pos.y + ray_end.y)
        //             circle(this.pos.x + ray_end.x, this.pos.y + ray_end.y, 3)
        //         }
        //     }
        // }

        this.buckets_to_check.clear()

        for (let i=-this.config.field_of_view; i<=this.config.field_of_view + this.config.field_of_view % ray_angle; i += ray_angle) {
            const ray = this.velocity.copy().normalize().rotate(i).mult(this.config.bucket_size)
            let ray_end = createVector(0, 0)
            for (let j=1; j*this.config.bucket_size <= this.config.influence + this.config.influence % this.config.bucket_size; j++) {
                ray_end.add(ray);
                const x = int((this.position.x + ray_end.x) / this.config.bucket_size)
                const y = int((this.position.y + ray_end.y) / this.config.bucket_size)
                if (x >= 0 && x < this.buckets.length && y >= 0 && y < this.buckets[0].length) {
                    this.buckets_to_check.add({x, y})
                }
            }
        }
    }

    draw_buckets() {
        if (!this.follow)
            return

        strokeWeight(5)
        stroke(200, 0, 0)
        fill(0, 0, 0, 0)
        this.buckets_to_check.forEach(coord => {
            rect(coord.x * this.config.bucket_size, coord.y * this.config.bucket_size, this.config.bucket_size, this.config.bucket_size)
        })
    }

    get_neighbours() {
        this.neighbours = []
        const influence2 = this.config.influence * this.config.influence

        this.buckets_to_check.forEach(coord => {
            this.buckets[coord.x][coord.y].forEach(boid => {
                if (boid === this)
                    return
                const angle = this.velocity.angleBetween(boid.position.copy().sub(this.position))
                if (abs(angle) <= this.config.field_of_view) {
                    const d2 = (this.position.x - boid.position.x) * (this.position.x - boid.position.x) + (this.position.y - boid.position.y) * (this.position.y - boid.position.y)
                    if (d2 <= influence2)
                        this.neighbours.push({boid: boid, dist: d2 / influence2})
                }
            })
        })
    }

    separation() {
        this.separation_vec = createVector()
        if (this.neighbours.length === 0)
            return

        this.neighbours.forEach(neighbour => {
            const {boid, dist} = neighbour
            let diff = p5.Vector.sub(this.position, boid.position)
            diff.mult(1 - dist)
            this.separation_vec.add(diff)
        })
        this.separation_vec.div(this.neighbours.length)

        this.separation_vec.sub(this.velocity).limit(this.config.max_force)
    }

    cohesion() {
        this.cohesion_vec = createVector()
        if (this.neighbours.length === 0)
            return

        this.neighbours.forEach(neighbour => {
            const boid = neighbour.boid
            this.cohesion_vec.add(boid.position)
        })

        this.cohesion_vec.div(this.neighbours.length)

        this.cohesion_vec.sub(this.position).setMag(this.config.max_speed).sub(this.velocity).limit(this.config.max_force)
    }

    align() {
        this.aligment_vec = createVector()
        if (this.neighbours.length === 0)
            return

        this.neighbours.forEach(neighbour => {
            const boid = neighbour.boid
            this.aligment_vec.add(boid.velocity)
        })
        this.aligment_vec.div(this.neighbours.length)

        this.aligment_vec.setMag(this.config.max_speed).sub(this.velocity).limit(this.config.max_force)
    }
}

