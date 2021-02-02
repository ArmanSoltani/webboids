/**
 *
 */
class Word {
    constructor(config) {
        this.config = config

        // Une matrice regroupant l'ensemble des buckets de l'espace
        this.buckets = []
        // Une liste de l'ensemble des boids de la simulation
        this.boids = []
    }

    /**
     * Reset la simulation
     */
    reset() {
        // Reset de la matrice des buckets
        this.buckets = []
        for (let i=0; i < Math.ceil(windowWidth / this.config.bucket_size); i++)
            this.buckets.push(new Array(Math.ceil(windowHeight / this.config.bucket_size)))

        // Création des buckets
        for (let x=0; x < this.buckets.length; x++) {
            for (let y = 0; y < this.buckets[0].length; y++) {
                let bucket_width = this.config.bucket_size
                let bucket_height = this.config.bucket_size

                // Si la taille de la fenetre n'est pas un multiple de config.bucket_size alors le dernier bucket est plus petit
                if ((x+1) * this.config.bucket_size > windowWidth)
                    bucket_width = windowWidth - x * this.config.bucket_size
                if ((y+1) * this.config.bucket_size > windowHeight)
                    bucket_height = windowHeight - y * this.config.bucket_size

                this.buckets[x][y] = new Bucket(x * this.config.bucket_size, y * this.config.bucket_size, bucket_width, bucket_height, this.config)
            }
        }

        // Création des boids
        // DEBUG le premier boid a l'attriut follow à true
        this.boids = []
        this.boids.push(new Boid(createVector(random(windowWidth), random(windowHeight)),
                                 p5.Vector.random2D().setMag(random(2, 4)),
                                10,
                                true,
                                 lerpColor(this.config.color1, this.config.color2, random()),
                                 this.config,
                                 this.buckets))
        for (let i=0; i<this.config.nb_boids; i++)
            this.boids.push(new Boid(createVector(random(windowWidth), random(windowHeight)),
                                     p5.Vector.random2D().setMag(random(2, 4)),
                                     10,
                                     false,
                                     lerpColor(this.config.color1, this.config.color2, random()),
                                     this.config,
                                     this.buckets))
    }

    /**
     * Ajuste le nombre de boid pour faire tourner la simulation entre 20 et 30 fps
     * Si la simulation est trop lente on supprime des boids sinon on en ajoute
     * A noter que le temps de calcul d'une frame est indépendant de l'état courant de la simulation
     */
    adjustBoidsNumber() {
        if (frameRate() < 20)
            this.boids.pop()
        else if (frameRate() > 30)
            this.boids.push(new Boid(createVector(random(windowWidth), random(windowHeight)),
                            p5.Vector.random2D().setMag(random(2, 4)),
                            10,
                            false,
                            lerpColor(this.config.color1, this.config.color2, random()),
                            this.config,
                            this.buckets))
    }

    /**
     * Update les buckets et boids
     */
    update() {
        this.adjustBoidsNumber()

        for (let x=0; x<this.buckets.length; x++) {
            for (let y=0; y<this.buckets[0].length; y++) {
                this.buckets[x][y].update()
            }
        }

        this.boids.forEach(boid => {
            boid.get_buckets()
            // boid.draw_buckets()
            boid.update()
        })
    }

    /**
     * Déplace et affiche les boids
     */
    draw() {
        this.boids.forEach(boid => {
            boid.move()
            boid.draw("line")
            // boid.draw_influences()
        })

        // this.draw_food()
        // this.draw_buckets()
    }

    /**
     * DEBUG affiche les sources de nourriture
      */
    draw_food() {
        for (let x=0; x<this.buckets.length; x++) {
            for (let y = 0; y < this.buckets[0].length; y++) {
                this.buckets[x][y].draw_food()
            }
        }
    }

    /**
     * DEBUG affiche les buckets
     */
    draw_buckets() {
        for (let x=0; x<this.buckets.length; x++) {
            for (let y=0; y<this.buckets[0].length; y++)
                this.buckets[x][y].draw()
        }
    }
}