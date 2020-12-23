const nb_boids = 100
let canvas_wight = 1000
let canvas_height = 800
let boids = []

let influence = 100
let separation_slider
let separation
let cohesion_slider
let cohesion
let aligment_slider
let aligment
const vel_max = 10
const vel_min = 3
const agility = 0.01


const bucket_size = influence * 2
let buckets = []

function drawArrow(base, vec, myColor) {
    push();
    stroke(myColor);
    strokeWeight(3);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
}

class Boid {
    constructor(pos, vel, length) {
        this.pos = pos
        this.vel = vel
        this.acc = createVector(0, 0)
        this.length = length

        this.bucket_x = Math.ceil(this.pos.x / bucket_size) - 1
        this.bucket_y = Math.ceil(this.pos.y / bucket_size) - 1
        buckets[this.bucket_x][this.bucket_y].add(this)
    }

    draw() {
        strokeWeight(1)
        stroke(0)
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
        this.vel = p5.Vector.lerp(this.vel, this.acc, agility)
        this.acc.mult(0)

        if (this.vel.mag() > vel_max)
            this.vel.normalize().mult(vel_max)
        if (this.vel.mag() < vel_min)
            this.acc = this.vel.copy().normalize().mult(vel_min)

        this.pos.add(this.vel)
        this.mirror_pos()

        const new_bucket_x = Math.ceil(this.pos.x / bucket_size) - 1
        const new_bucket_y = Math.ceil(this.pos.y / bucket_size) - 1
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
        stroke(200)
        fill(0,0,0,0)
        circle(this.pos.x, this.pos.y, influence * 2)

        const neighbours = this.get_neighbours()

        strokeWeight(1)
        stroke(0, 200, 0)
        neighbours.forEach(boid => {
            line(this.pos.x, this.pos.y, boid.pos.x, boid.pos.y)
        })
    }

    get_neighbours() {
        let neighbours = []
        for (let i=-1; i<=1; i++) {
            for (let j=-1; j<=1; j++) {
                const bucket_x = this.bucket_x + i
                const bucket_y = this.bucket_y + j
                if (bucket_x >= 0 && bucket_x < buckets.length && bucket_y >= 0 && bucket_y < buckets[0].length) {
                    buckets[bucket_x][bucket_y].forEach(boid => {
                        if (dist(this.pos.x, this.pos.y, boid.pos.x, boid.pos.y) <= influence)
                            neighbours.push(boid)
                    })
                }
            }
        }
        return neighbours
    }

    separation() {
        const neighbours = this.get_neighbours()
        let separation_vec = createVector(0, 0)
        neighbours.forEach(boid => {
            const d = dist(this.pos.x, this.pos.y, boid.pos.x, boid.pos.y)
            let boid_vec = createVector(this.pos.x - boid.pos.x, this.pos.y - boid.pos.y).normalize().mult((1 - d / influence) * influence)
            separation_vec.add(boid_vec)
        })
        separation_vec.div(neighbours.length)

        separation_vec.mult(separation)
        this.acc.add(separation_vec)

        // stroke(0, 250, 0)
        // strokeWeight(1)
        // line(this.pos.x, this.pos.y, this.pos.x + separation_vec.x, this.pos.y + separation_vec.y)
    }

    cohesion() {
        const neighbours = this.get_neighbours()
        let cohesion_vec = createVector(0, 0)
        neighbours.forEach(boid => cohesion_vec.add(boid.pos))
        cohesion_vec.div(neighbours.length)

        cohesion_vec.sub(this.pos).mult(cohesion)
        this.acc.add(cohesion_vec)

        // stroke(0, 0, 250)
        // strokeWeight(1)
        // line(this.pos.x, this.pos.y, this.pos.x + cohesion_vec.x, this.pos.y + cohesion_vec.y)
    }

    aligment() {
        const neighbours = this.get_neighbours()
        let aligment_vec = createVector(0, 0)
        neighbours.forEach(boid => aligment_vec.add(boid.vel))
        aligment_vec.div(neighbours.length)

        aligment_vec.sub(this.vel).mult(aligment)
        this.acc.add(aligment_vec)

        // drawArrow(this.pos, aligment_vec.copy().mult(10), color(250, 0, 0))
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
    for (let i=0; i<nb_boids; i++)
        boids.push(new Boid(createVector(int(random(canvas_wight)), int(random(canvas_height))),
            p5.Vector.random2D().mult(random(vel_min, vel_max)),20))

}

function setup() {
    if (canvas_wight % bucket_size !== 0)
        canvas_wight -= canvas_wight % bucket_size
    if (canvas_height % bucket_size !== 0)
        canvas_height -= canvas_height % bucket_size

    createCanvas(canvas_wight, canvas_height)

    textSize(15)
    separation_slider = createSlider(0, 100, 50);
    separation_slider.position(20, canvas_height + 20);
    cohesion_slider = createSlider(0, 100, 20);
    cohesion_slider.position(20, canvas_height + 50);
    aligment_slider = createSlider(0, 100, 80);
    aligment_slider.position(20, canvas_height + 80);

    button = createButton("reset");
    button.position(200, canvas_height + 20)
    button.mouseClicked(() => reset())


    reset()
}


function draw() {
    separation = separation_slider.value() / 100
    cohesion = cohesion_slider.value() / 100
    aligment = aligment_slider.value() / 100

    background(220, 220, 220)

    // draw_buckets()

    boids.forEach(boid => {
        boid.separation()
        boid.cohesion()
        boid.aligment()
        boid.update()
        boid.draw()
    })

    // draw_influences()
}

function draw_influences() {
    boids.forEach(boid => {
        boid.draw_influences()
    })
}

function draw_buckets() {
    strokeWeight(0)
    for (let x=0; x<buckets.length; x++) {
        for (let y=0; y<buckets[0].length; y++) {
            const nb_boid_in_bucket = buckets[x][y].size
            fill(255, 0, 0, 255 * nb_boid_in_bucket / nb_boids)
            rect(x * bucket_size, y * bucket_size, bucket_size, bucket_size);
        }
    }

    strokeWeight(1)
    stroke(200)
    for (let x=0; x<buckets.length; x++) {
        line(x * bucket_size + bucket_size, 0, x * bucket_size + bucket_size, canvas_height)
    }
    for (let y=0; y<buckets[0].length; y++) {
        line(0, y * bucket_size + bucket_size, canvas_wight, y * bucket_size + bucket_size)
    }
}