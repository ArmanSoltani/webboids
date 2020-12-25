const nb_boids = 1000
let canvas_wight = 1000
let canvas_height = 800
let boids = []

let influence = 75
let separation_slider
let separation
let cohesion_slider
let cohesion
let aligment_slider
let aligment
const vel_max = 10
const vel_min = 3
const agility = 0.05
let field_of_view

const bucket_size = influence * 2
let buckets = []

class Boid {
    constructor(pos, vel, length, follow) {
        this.follow = follow
        this.pos = pos
        this.vel = vel
        this.acc = createVector(0, 0)
        this.length = length

        this.bucket_x = int(this.pos.x / bucket_size)
        this.bucket_y = int(this.pos.y / bucket_size)
        buckets[this.bucket_x][this.bucket_y].add(this)

        this.neighbours = []
        this.buckets_to_check = new Array(3)
        for (let i=0; i<3; i++)
            this.buckets_to_check[i] = new Array(3).fill(false)
    }

    draw() {
        strokeWeight(0)
        stroke(0)
        if (this.follow)
            fill(200, 100, 200)
        else
            fill(250, 250, 250)

        const dir1 = createVector(this.vel.x, this.vel.y).normalize()
        const dir2 = createVector(dir1.x, dir1.y).rotate(PI / 2)

        const x1 = this.pos.x + dir1.x * this.length
        const y1 = this.pos.y + dir1.y * this.length
        const x2 = this.pos.x +  dir2.x * this.length / 3
        const y2 = this.pos.y + dir2.y * this.length / 3
        const x3 = this.pos.x - dir2.x * this.length / 3
        const y3 = this.pos.y - dir2.y * this.length / 3

        triangle(x1, y1, x2, y2, x3, y3)
    }

    update() {
        this.vel.mult(1 - agility).add(this.acc.mult(agility))
        this.acc.mult(0)

        if (this.vel.mag() > vel_max)
            this.vel.normalize().mult(vel_max)
        if (this.vel.mag() < vel_min)
            this.vel.normalize().mult(vel_min)

        this.pos.add(this.vel)
        this.mirror_pos()

        const new_bucket_x = int(this.pos.x / bucket_size)
        const new_bucket_y = int(this.pos.y / bucket_size)
        // console.log(this.pos.x, this.pos.y, new_bucket_x, new_bucket_y)

        if (this.bucket_x !== new_bucket_x || this.bucket_y !== new_bucket_y) {
            buckets[this.bucket_x][this.bucket_y].delete(this)
            buckets[new_bucket_x][new_bucket_y].add(this)
            this.bucket_x = new_bucket_x
            this.bucket_y = new_bucket_y
        }
    }

    mirror_pos() {
        if (this.pos.x < 0)
            this.pos.x += canvas_wight
        if (this.pos.y < 0)
            this.pos.y += canvas_height
        if (this.pos.x > canvas_wight)
            this.pos.x -= canvas_wight
        if (this.pos.y > canvas_height)
            this.pos.y -= canvas_height
    }

    draw_influences() {
        if (!this.follow)
            return

        strokeWeight(0.25)
        stroke(200)
        fill(0,0,0,0)
        circle(this.pos.x, this.pos.y, influence * 2)

        strokeWeight(1)
        stroke(0, 200, 0)
        this.neighbours.forEach(neighbour => {
            const boid = neighbour.boid
            line(this.pos.x, this.pos.y, boid.pos.x, boid.pos.y)
        })
    }

    draw_separation() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(0, 0, 250)
        line(this.pos.x, this.pos.y, this.pos.x + this.separation_vec.x * 10, this.pos.y + this.separation_vec.y * 10)
    }

    draw_coherence() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(0, 250, 0)
        line(this.pos.x, this.pos.y, this.pos.x + this.cohesion_vec.x * 10, this.pos.y + this.cohesion_vec.y * 10)
    }

    draw_alignment() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(250, 0, 0)
        line(this.pos.x, this.pos.y, this.pos.x + this.aligment_vec.x * 10, this.pos.y + this.aligment_vec.y * 10)
    }

    draw_vel() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(250, 0, 0)
        line(this.pos.x, this.pos.y, this.pos.x + this.vel.x * 30, this.pos.y + this.vel.y * 30)
    }

    draw_acc() {
        if (!this.follow)
            return

        strokeWeight(3)
        stroke(0, 250, 0)
        line(this.pos.x, this.pos.y, this.pos.x + this.acc.x * 30, this.pos.y + this.acc.y * 30)
    }

    get_buckets() {
        if (this.follow) {
            stroke(0, 0, 250)
            fill(0, 0, 250)
            strokeWeight(1.5)
            for (let i=-field_of_view; i<=field_of_view; i += field_of_view / 2) {
                const ray = this.vel.copy().normalize().mult(influence).rotate(i)
                line(this.pos.x, this.pos.y, this.pos.x + ray.x, this.pos.y + ray.y)
                circle(this.pos.x + ray.x, this.pos.y + ray.y, 3)
            }
        }

        for (let x=-1; x<=1; x++) {
            for (let y=-1; y<=1; y++)
                this.buckets_to_check[x+1][y+1] = false
        }

        this.buckets_to_check[1][1] = true

        for (let i=-field_of_view; i<=field_of_view; i += field_of_view / 2) {
            const ray = this.vel.copy().normalize().mult(influence).rotate(i)
            const x = int((this.pos.x + ray.x) / bucket_size)
            const y = int((this.pos.y + ray.y) / bucket_size)
            if (x >= 0 && x < buckets.length && y >= 0 && y < buckets[0].length) {
                this.buckets_to_check[x - this.bucket_x + 1][y - this.bucket_y + 1] = true
            }
        }
    }

    draw_buckets() {
        if (!this.follow)
            return

        strokeWeight(5)
        stroke(200, 0, 0)
        fill(0, 0, 0, 0)
        for (let x=-1; x<=1; x++) {
            for (let y=-1; y<=1; y++) {
                if (this.buckets_to_check[x+1][y+1])
                    rect((this.bucket_x + x) * bucket_size, (this.bucket_y + y) * bucket_size, bucket_size, bucket_size);
            }
        }
    }

    get_neighbours() {
        this.neighbours = []
        const influence2 = influence * influence

        for (let x=-1; x<=1; x++) {
            for (let y=-1; y<=1; y++)
                if(this.buckets_to_check[x+1][y+1]) {
                    buckets[this.bucket_x + x][this.bucket_y + y].forEach(boid => {
                        if (boid === this)
                            return
                        const angle = this.vel.angleBetween(boid.pos.copy().sub(this.pos))
                        if (abs(angle) <= field_of_view) {
                            const d2 = (this.pos.x - boid.pos.x) * (this.pos.x - boid.pos.x) + (this.pos.y - boid.pos.y) * (this.pos.y - boid.pos.y)
                            if (d2 <= influence2)
                                this.neighbours.push({boid: boid, dist: sqrt(d2)})
                        }
                    })
                }
        }
    }

    separation() {
        this.separation_vec = createVector(0, 0)
        if (this.neighbours.length === 0)
            return
        this.neighbours.forEach(neighbour => {
            const {boid, dist} = neighbour
            this.separation_vec.add(this.pos.copy().sub(boid.pos).normalize().mult((1 - dist / influence) * influence))
        })
        this.separation_vec.div(this.neighbours.length)

        this.separation_vec.mult(separation)
        this.acc.add(this.separation_vec)
    }

    cohesion() {
        if (this.neighbours.length === 0)
            return
        this.cohesion_vec = createVector(0, 0)
        this.neighbours.forEach(neighbour => {
            const boid = neighbour.boid
            this.cohesion_vec.add(boid.pos)
        })

        this.cohesion_vec.div(this.neighbours.length)

        this.cohesion_vec.sub(this.pos).mult(cohesion)
        this.acc.add(this.cohesion_vec)
    }

    aligment() {
        if (this.neighbours.length === 0)
            return
        this.aligment_vec = createVector(0, 0)
        this.neighbours.forEach(neighbour => {
            const boid = neighbour.boid
            this.aligment_vec.add(boid.vel)
        })
        this.aligment_vec.div(this.neighbours.length)

        this.aligment_vec.sub(this.vel).mult(aligment)
        this.acc.add(this.aligment_vec)
    }
}

function reset() {
    buckets = []
    for (let i=0; i<Math.ceil(canvas_wight / bucket_size); i++)
        buckets.push(new Array(Math.ceil(canvas_height / bucket_size)))
    for (let x=0; x<buckets.length; x++) {
        for (let y = 0; y < buckets[0].length; y++) {
            buckets[x][y] = new Set()
        }
    }

    boids = []
    boids.push(new Boid(createVector(int(random(canvas_wight)), int(random(canvas_height))),
        p5.Vector.random2D().mult(random(vel_min, vel_max)),20, true))
    for (let i=0; i<nb_boids-1; i++)
        boids.push(new Boid(createVector(int(random(canvas_wight)), int(random(canvas_height))),
            p5.Vector.random2D().mult(random(vel_min, vel_max)),10, false))
}


function setup() {
    if (canvas_wight % bucket_size !== 0)
        canvas_wight -= canvas_wight % bucket_size
    if (canvas_height % bucket_size !== 0)
        canvas_height -= canvas_height % bucket_size

    console.log(`using dimentions: ${canvas_wight} x ${canvas_height}`)

    createCanvas(canvas_wight, canvas_height)

    separation_slider = createSlider(0, 100, 70);
    separation_slider.position(20, canvas_height + 20);
    cohesion_slider = createSlider(0, 100, 40);
    cohesion_slider.position(20, canvas_height + 50);
    aligment_slider = createSlider(0, 100, 50);
    aligment_slider.position(20, canvas_height + 80);

    button = createButton("reset");
    button.position(200, canvas_height + 20)
    button.mouseClicked(() => reset())

    field_of_view = radians(90)

    reset()
}


function draw() {
    separation = separation_slider.value() / 100
    cohesion = cohesion_slider.value() / 100
    aligment = aligment_slider.value() / 100

    // background(0, 0, 0, 10)
    // background(0, 0, 0, 50)
    background(0, 0, 0)

    // draw_buckets()

    boids.forEach(boid => {
        boid.get_buckets()
        boid.draw_buckets()
        boid.get_neighbours()
        boid.separation()
        boid.cohesion()
        boid.aligment()
        // boid.draw_vel()
        // boid.draw_acc()
        boid.update()
        boid.draw()
        boid.draw_influences()
        // boid.draw_separation()
        // boid.draw_coherence()
        // boid.draw_alignment()
    })

    textSize(20)
    text(frameRate(), 25, 25)
}


function draw_buckets() {
    strokeWeight(0)
    for (let x=0; x<buckets.length; x++) {
        for (let y=0; y<buckets[0].length; y++) {
            const nb_boid_in_bucket = buckets[x][y].size
            fill(255 * 10 * nb_boid_in_bucket / nb_boids, 0, 0)
            rect(x * bucket_size, y * bucket_size, bucket_size, bucket_size);
        }
    }

    strokeWeight(0.25)
    stroke(200)
    for (let x=0; x<buckets.length; x++) {
        line(x * bucket_size + bucket_size, 0, x * bucket_size + bucket_size, canvas_height)
    }
    for (let y=0; y<buckets[0].length; y++) {
        line(0, y * bucket_size + bucket_size, canvas_wight, y * bucket_size + bucket_size)
    }
}