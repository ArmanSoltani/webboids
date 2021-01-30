class Config {
    constructor() {
        this.nb_boids = 2500
        this.canvas_wight = windowWidth
        this.canvas_height = windowHeight

        this.bucket_size = 30

        this.influence = 50
        this.max_speed = 4
        this.min_speed = 2
        this.max_force = 0.25
        this.field_of_view = radians(180)

        this.food_proba = 0.0001

        this.separation_slider = createSlider(0, 2, 1.2, 0.1)
        this.cohesion_slider = createSlider(0, 2, 1.2, 0.1)
        this.aligment_slider = createSlider(0, 2, 1, 0.1)
        this.reset_button = createButton("reset")
    }

    setup(reset_fn) {
        if (this.canvas_wight % this.bucket_size !== 0)
            this.canvas_wight -= this.canvas_wight % this.bucket_size
        if (this.canvas_height % this.bucket_size !== 0)
            this.canvas_height -= this.canvas_height % this.bucket_size

        console.log(`using dimentions: ${this.canvas_wight} x ${this.canvas_height}`)

        this.separation_slider.position(20, this.canvas_height + 20);
        this.cohesion_slider.position(20, this.canvas_height + 50);
        this.aligment_slider.position(20, this.canvas_height + 80);
        this.reset_button.position(200, this.canvas_height + 20)
        this.reset_button.mouseClicked(() => reset_fn())
    }

    draw() {

    }
}
