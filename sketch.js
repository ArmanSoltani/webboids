const nb_boids = 30
let canvas_wight = 1000
let canvas_height = 800
let boids = []

const influence = 100
const bucket_size = influence * 2
let buckets = []
for (let i=0; i<Math.ceil(canvas_wight / bucket_size); i++)
    buckets.push(new Array(Math.ceil(canvas_height / bucket_size)))
for (let x=0; x<buckets.length; x++) {
    for (let y=0; y<buckets[0].length; y++) {
        buckets[x][y] = new Set()
    }
}

if (canvas_wight % bucket_size !== 0)
    canvas_wight -= canvas_wight % bucket_size
if (canvas_height % bucket_size !== 0)
    canvas_height -= canvas_height % bucket_size


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
            if (dist(this.pos.x, this.pos.y, boid.pos.x, boid.pos.y) <= influence)
                line(this.pos.x, this.pos.y, boid.pos.x, boid.pos.y)
        })
    }

    get_neighbours() {
        let neighbours = []
        for (let i=-1; i<=1; i++) {
            for (let j=-1; j<=1; j++) {
                const bucket_x = this.bucket_x + i
                const bucket_y = this.bucket_y + j
                if (bucket_x >= 0 && bucket_x < buckets.length && bucket_y >= 0 && bucket_y < buckets[0].length)
                    buckets[bucket_x][bucket_y].forEach(boid => neighbours.push(boid))
            }
        }
        return neighbours
    }

}

function setup() {
    createCanvas(canvas_wight, canvas_height)

    for (let i=0; i<nb_boids; i++)
        boids.push(new Boid(createVector(int(random(canvas_wight)), int(random(canvas_height))),
                            p5.Vector.fromAngle(random(2 * PI)).mult(2),20))
}

function draw() {
    background(220)

    draw_buckets()

    boids.forEach(boid => {
        boid.update()
        boid.draw()
    })

    draw_influences()
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