let boids
let buckets
let config


function reset() {
    buckets = []
    for (let i=0; i<Math.ceil(config.canvas_wight / config.bucket_size); i++)
        buckets.push(new Array(Math.ceil(config.canvas_height / config.bucket_size)))
    for (let x=0; x<buckets.length; x++) {
        for (let y = 0; y < buckets[0].length; y++) {
            buckets[x][y] = new Set()
        }
    }

    const color1 = color(224, 170, 99)
    const color2 = color(113, 184, 83)

    boids = []
    boids.push(new Boid(createVector(random(config.canvas_wight), random(config.canvas_height)),
                        p5.Vector.random2D().setMag(random(2, 4)),
                        20,
                        true,
                        lerpColor(color1, color2, random()),
                        config,
                        buckets))
    for (let i=0; i<config.nb_boids; i++)
        boids.push(new Boid(createVector(random(config.canvas_wight), random(config.canvas_height)),
                            p5.Vector.random2D().setMag(random(2, 4)),
                            20,
                            false,
                            lerpColor(color1, color2, random()),
                            config,
                            buckets))
}

function setup() {
    config = new Config()
    config.setup(reset)

    createCanvas(config.canvas_wight, config.canvas_height)

    reset()
    background(10)
}


function draw() {
    // background(10, 10, 10, 5)
    background(10)

    // draw_buckets()

    boids.forEach(boid => {
        boid.get_buckets()
        boid.draw_buckets()
        boid.get_neighbours()
        // boid.draw_vel()
        // boid.draw_acc()
        boid.update()
    })

    boids.forEach(boid => {
        boid.move()
        boid.draw("triangle")
        // boid.draw_influences()
        // boid.draw_separation()
        // boid.draw_coherence()
        // boid.draw_alignment()
    })

    stroke(200)
    fill(10)
    rect(0, 0, 100, 40)
    textSize(20)
    stroke(200)
    fill(200)
    strokeWeight(1)
    text(round(frameRate(), 2), 25, 25)
}


function draw_buckets() {
    strokeWeight(0)
    for (let x=0; x<buckets.length; x++) {
        for (let y=0; y<buckets[0].length; y++) {
            const nb_boid_in_bucket = buckets[x][y].size
            fill(255 * 10 * nb_boid_in_bucket / config.nb_boids, 0, 0)
            rect(x * config.bucket_size, y * config.bucket_size, config.bucket_size, config.bucket_size);
        }
    }

    strokeWeight(0.25)
    stroke(200)
    for (let x=0; x<buckets.length; x++) {
        line(x * config.bucket_size + config.bucket_size, 0, x * config.bucket_size + config.bucket_size, config.canvas_height)
    }
    for (let y=0; y<buckets[0].length; y++) {
        line(0, y * config.bucket_size + config.bucket_size, config.canvas_wight, y * config.bucket_size + config.bucket_size)
    }
}