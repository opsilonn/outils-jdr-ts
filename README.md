# assistant-jdr-web
Ce projet vise à donner différent outils pour faciliter le travail du MJ.
Actuellement, il contient :
- création rapide de fiches de personnage-non-joueur
- gestionnaire de musiques et sons


## Installation du projet

Node.js est nécessaire pour faire fonctionner le projet, et peut être [téléchargé ici](https://nodejs.org/en)

Il faut **impérativement** créer le fichier */server/local.server.config.js* avec le contenu suivant, (qui peut être trouvé dans le [fichier suivant](https://github.com/opsilonn/outils-jdr-ts/blob/main/server/local.server.config.example.js)):

```js
module.exports = {
    SESSION_SECRET: "randomly generated string",
    POSTGRES_USER: "postgres",
    POSTGRES_HOST: "localhost",
    POSTGRES_DB: "example_app",
    POSTGRES_PASSWORD: "123motdepassesecu",
}
```

```bash
# Installer les dépendances
$ npm install

# Lancer le projet
$ npm run dev
```
Le projet sera lancé à cette adresse : **localhost:3000**


## Ajouter la musique

Pour inclure de la musique au projet, il faut ajouter des fichiers (.mp3, .webm...) dans l'arborescence :

```bash
/static/audio/
|
|-- Ambiance
|-- Musique
|-- SFX
```

**Les dossiers suivants ne doivent pas être modifiés !**

### `ambiance`
Les sons d'ambiance, tel qu'en ville ou en forêt

### `musique`
Les musiques, pour le combat ou installer une atmosphère

### `SFX`
Les sons divers, comme un coup de feu, une explosion ou un bruit de quelqu'un qui toque


Pour le reste, on peut librement ajouter des fichiers et des sous-dossiers.

Ainsi, le projet peut ressembler à :

```bash
/static/audio/
|
|-- Ambiance
    |-- Forêt
      |-- forêt.mp3
    |-- Nature
      |-- vent.mp3
      |-- vagues et mouettes.mp3
    |-- Ville
      |-- bibliothèque.mp3
      |-- restaurant.mp3
|-- Musique
    |-- Combat
      |-- musique de combat 1.mp3
      |-- musique de combat 2.mp3
      |-- musique de combat 3.mp3
    |-- Jazz
      |-- reprise jazz - call of ktulu.mp3
      |-- reprise jazz - fell good inc.mp3
    |-- Orchestral
      |-- Dies Irae.mp3
|-- SFX
    |-- Arme
      |-- tir    
        |-- Arme
          |-- tir de Beretta.mp3
          |-- tir de Revolver.mp3
      |-- Explosion
        |-- explosion distante.mp3
    |-- Véhicule
        |-- moteur de camion.mp3
        |-- moteur de voiture.mp3
```

## Auteurs
Ce projet a été fait par les personnes suivantes :
* **BEGEOT Hugues** - [son dépôt  GitHub](https://github.com/opsilonn)

Voir aussi [la liste des contributeurs](https://github.com/opsilonn/outils-jdr-ts/graphs/contributors) qui ont participaté au projet.
