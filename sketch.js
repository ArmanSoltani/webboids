const nb_boids = 10
const canvas_wight = 1000
const canvas_height = 800
let boids = []


class Boid {
    constructor(pos, vel, lenght) {
        this.pos = pos
        this.vel = vel
        this.acc = createVector(0, 0)
        this.lenght = lenght
    }

    draw() {
        const dir1 = createVector(this.vel.x, this.vel.y).normalize()
        const dir2 = createVector(dir1.x, dir1.y).rotate(PI / 2)

        const x1 = this.pos.x + dir1.x * this.lenght
        const y1 = this.pos.y + dir1.y * this.lenght
        const x2 = this.pos.x +  dir2.x * this.lenght / 3
        const y2 = this.pos.y + dir2.y * this.lenght / 3
        const x3 = this.pos.x - dir2.x * this.lenght / 3
        const y3 = this.pos.y - dir2.y * this.lenght / 3

        triangle(x1, y1, x2, y2, x3, y3)
    }

    update() {
        this.pos.add(this.vel)
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

    boids.forEach(boid => {
        boid.update()
        boid.draw()
    })
}