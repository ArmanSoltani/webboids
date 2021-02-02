/**
 * Classe regroupant les valeurs de paramétrage de la simulation
 */
class Config {
    constructor() {
        // Le nombre de boid à afficher
        this.nb_boids = 1000

        // Couleurs possibles des boids, chaque boid a une couleur composée de ces deux teintes
        this.color1 = color(255, 179, 163)
        this.color2 = color(169, 180, 214)

        // La taille en pixel des buckets utilisés pour accélérer la recherche des voisins
        this.bucket_size = 30

        // La taille en pixel du "champ de vision" des boids
        this.influence = 50

        // La vitesse maximale en pixel/frame des boids
        this.max_speed = 80

        // La magnitude maximal des forces appliquées aux boids
        this.max_force = 5

        // L'angle du "champ de vision" du boid
        this.field_of_view = radians(180)

        // La probabilité par frame que de la nourriture apparaisse dans un bucket
        this.food_proba = 0.0001
        // La quantité maximal de nourriture pouvant apparaitre
        this.max_food_quantity = 15

        // La force des vecteurs de séparation, cohésion, alignement et faim
        this.separation_strenght = 1.2
        this.cohesion_strenght = 1.2
        this.alignment_strenght = 1.
        this.hunger_strenght = 2.
    }
}
