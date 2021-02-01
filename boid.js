/**
 *
 */
class Boid {
    constructor(pos, vel, length, follow, color, config, buckets) {
        this.config = config
        this.buckets = buckets

        // Propriétés visuelles du boid
        this.color = color
        this.length = length

        // Propriétés physiques du boid
        this.position = pos
        this.velocity = vel
        this.acceleration = createVector()
        // L'accéleration peut s'interpréter comme la force que le boid va s'appliquer
        // à lui même afin de changer sa position (il n'y a aucune force extérieures dans cette simulation)

        // La position du boid à l'instant t - 1
        this.prev_pos = pos.copy()

        // Le boid update le bucket dans lequel il se situe
        this.self_bucket = this.buckets[int(this.position.x / config.bucket_size)][int(this.position.y / config.bucket_size)]
        this.self_bucket.boids.add(this)

        // Le set des buckets prochent de ce boid,
        // calculé par la fonction this.get_buckets()
        this.buckets_to_check = new Set()

        // Paramétre de debug permettant de suivre un boid en particulier
        this.follow = follow
    }

    /**
     * Dessine le boid à l'écran
     * @param type La forme du boid ["triangle", "line"]
     */
    draw(type) {
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

    /**
     * Déplace le boid d'une frame
     */
    move() {
        this.position.add(this.velocity)
        this.velocity.add(this.acceleration)

        this.velocity.limit(this.config.max_speed)
        this.acceleration.set(0, 0)

        this.mirror_pos()

        // Si le boid change de bucket alors on update les buckets
        const new_bucket = this.buckets[int(this.position.x / this.config.bucket_size)][int(this.position.y / this.config.bucket_size)]
        if (this.self_bucket !== new_bucket) {
            this.self_bucket.boids.delete(this)
            new_bucket.boids.add(this)
            this.self_bucket = new_bucket
        }
    }

    /**
     * Update le vecteur d'accélération
     */
    update() {
        // Calcul des vecteurs de séparation, cohésion, alignement et faim
        this.alignment()
        this.cohesion()
        this.separation()
        this.hunting()

        // Modulation des forces
        this.aligment_vec.mult(this.config.alignment_strenght)
        this.cohesion_vec.mult(this.config.cohesion_strenght)
        this.separation_vec.mult(this.config.separation_strenght)
        this.hunting_vec.mult(this.config.hunger_strenght)

        // Agregation des forces
        this.acceleration.add(this.aligment_vec)
        this.acceleration.add(this.cohesion_vec)
        this.acceleration.add(this.separation_vec)
        this.acceleration.add(this.hunting_vec)

    }

    /**
     * Si le boid sort de l'écran cette fonction modifie sa position pour qui apparaisse au niveau du bord opposé
     */
    mirror_pos() {
        if (this.position.x < 0) {
            this.position.x += windowWidth
            this.prev_pos.x += windowWidth
        }
        if (this.position.y < 0) {
            this.position.y += windowHeight
            this.prev_pos.y += windowHeight
        }
        if (this.position.x > windowWidth) {
            this.position.x -= windowWidth
            this.prev_pos.x -= windowWidth
        }
        if (this.position.y > windowHeight) {
            this.position.y -= windowHeight
            this.prev_pos.y -= windowHeight
        }
    }

    /**
     * Accumule l'ensemble des buckets voisins du boid dans le Set this.buckets_to_check
     */
    get_buckets() {
        const ray_angle = this.config.bucket_size / this.config.influence

        this.buckets_to_check.clear()

        for (let i=-this.config.field_of_view; i<=this.config.field_of_view + this.config.field_of_view % ray_angle; i += ray_angle) {
            const ray = this.velocity.copy().normalize().rotate(i).mult(this.config.bucket_size)
            let ray_end = createVector()
            for (let j=1; j*this.config.bucket_size <= this.config.influence + this.config.influence % this.config.bucket_size; j++) {
                ray_end.add(ray);
                const x = int((this.position.x + ray_end.x) / this.config.bucket_size)
                const y = int((this.position.y + ray_end.y) / this.config.bucket_size)
                if (x >= 0 && x < this.buckets.length && y >= 0 && y < this.buckets[0].length) {
                    if (this.buckets[x][y].boids.size > 0)
                        this.buckets_to_check.add(this.buckets[x][y])
                }
            }
        }
    }

    /**
     * Calcul le vecteur de séparation du boid
     * Ce vecteur symbolise l'envie du boid d'éviter les zones bondées
     */
    separation() {
        this.separation_vec = createVector()

        let n = 0
        this.buckets_to_check.forEach(bucket => {
            // Si le boid est dans ce bucket alors il ne doit pas s'influence pas lui-même
            let nb_boids_in_bucket = bucket.boids.size
            if (bucket === this.self_bucket)
                nb_boids_in_bucket--
            if (nb_boids_in_bucket <= 0)
                return

            // Calcul du vecteur de séparation
            let diff = p5.Vector.sub(this.position, bucket.position_mean)
            let d = (this.position.x - bucket.position_mean.x) * (this.position.x - bucket.position_mean.x) +
                    (this.position.y - bucket.position_mean.y) * (this.position.y - bucket.position_mean.y)
            diff.div(d)
            diff.mult(nb_boids_in_bucket)
            this.separation_vec.add(diff)

            n += nb_boids_in_bucket
        })
        if (n !== 0) {
            // formation du vecteur de "steering"
            this.separation_vec.div(n)
            this.separation_vec.setMag(this.config.max_speed)
            this.separation_vec.sub(this.velocity)
            this.separation_vec.limit(this.config.max_force)

        }
    }

    /**
     * Calcul le vecteur de cohésion du boid
     * Ce vecteur symbolise l'envie du boid de rejoindre le centre du flock
     */
    cohesion() {
        this.cohesion_vec = createVector()

        let n = 0
        this.buckets_to_check.forEach(bucket => {
            // Si le boid est dans ce bucket alors il ne doit pas s'influence pas lui-même
            let nb_boids_in_bucket = bucket.boids.size
            if (bucket === this.self_bucket)
                nb_boids_in_bucket--
            if (nb_boids_in_bucket === 0)
                return

            // Calcul du vecteur de cohésion
            this.cohesion_vec.add(p5.Vector.mult(bucket.position_mean, nb_boids_in_bucket))

            n += nb_boids_in_bucket
        })
        if (n !== 0) {
            // formation du vecteur de "steering"
            this.cohesion_vec.div(n)
            this.cohesion_vec.sub(this.position)
            this.cohesion_vec.setMag(this.config.max_speed)
            this.cohesion_vec.sub(this.velocity)
            this.cohesion_vec.limit(this.config.max_force)
        }

    }

    /**
     * Calcul le vecteur d'alignement du boid
     * Ce vecteur symbolise l'envie du boid de se diriger dans la même diretion que le flock
     */
    alignment() {
        this.aligment_vec = createVector(0, 0)

        let n = 0
        this.buckets_to_check.forEach(bucket => {
            // Si le boid est dans ce bucket alors il ne doit pas s'influence pas lui-même
            let nb_boids_in_bucket = bucket.boids.size
            if (bucket === this.self_bucket)
                nb_boids_in_bucket--
            if (nb_boids_in_bucket === 0)
                return

            // Calcul du vecteur de cohésion
            this.aligment_vec.add(p5.Vector.mult(bucket.velocity_mean, nb_boids_in_bucket))

            n += nb_boids_in_bucket
        })
        if (n !== 0) {
            // formation du vecteur de "steering"
            this.aligment_vec.div(n)
            this.aligment_vec.setMag(this.config.max_speed)
            this.aligment_vec.sub(this.velocity)
            this.aligment_vec.limit(this.config.max_force)
        }
    }

    /**
     * Calcul le vecteur de "recherche de nourriture"
     * Ce vecteur symbolise l'envie du boid de se diriger vers des sources de nourriture
     */
    hunting() {
        this.hunting_vec = createVector(0, 0)

        let n = 0
        this.buckets_to_check.forEach(bucket => {
            // Si le bucket ne continent pas de nourriture on s'arrête là
            if (bucket.food === null)
                return

            // Si le boid se situe sur une source de nourriture alors il en mange une partie
            if (bucket === this.self_bucket && dist(this.position.x, this.position.y, bucket.food.position.x, bucket.food.position.y) < 10) {
                    bucket.food.quantity--
                    if (bucket.food.quantity <= 0)
                        bucket.food = null
            }
            else {
                // Calcul du vecteur de "recherche de nourriture"
                this.hunting_vec.add(bucket.food.position)
                n++
            }
        })
        if (n !== 0) {
            // formation du vecteur de "steering"
            this.hunting_vec.div(n)
            this.hunting_vec.sub(this.position)
            this.hunting_vec.setMag(this.config.max_speed)
            this.hunting_vec.sub(this.velocity)
            this.hunting_vec.limit(this.config.max_force)
        }
    }

    /**
     * DEBUG Affiche les buckets voisins du boid avec l'attribut follow
     */
    draw_buckets() {
        if (!this.follow)
            return

        this.buckets_to_check.forEach(bucket => bucket.draw())
    }

    /**
     * DEBUG Affiche le rayon d'influence du boid avec l'attribut follow
     */
    draw_influences() {
        if (!this.follow)
            return

        strokeWeight(0.25)
        stroke(200)
        fill(0,0,0,0)
        circle(this.position.x, this.position.y, this.config.influence * 2)
    }
}

