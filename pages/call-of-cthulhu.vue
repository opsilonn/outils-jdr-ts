<template>
  <v-container>
    <!-- Titre -->
    <h2 class="text-center">L'appel de Cthulhu</h2>

    <!-- Boutons -->
    <div class="d-flex justify-space-around">
      <!-- Bouton relancer -->
      <v-btn @click="applyOrientation()">
        <v-icon left> mdi-dice-6-outline </v-icon>
        Relancer
      </v-btn>

      <!-- Bouton réinitialiser -->
      <v-btn @click="resetForm()">
        <v-icon left> mdi-autorenew </v-icon>
        Réinitialiser
      </v-btn>
    </div>

    <!-- stats -->
    <v-row align="center" justify="center">
      <!-- col n° 1 - GUI -->
      <v-col class="pa-4" sm="12" md="4">
        <!-- Orientation -->
        <v-select class="pa-8" v-model="orientation" :items="itemsOrientation" label="Orientation" @change="applyOrientation()" />

        <!-- Âge -->
        <v-select class="pa-8" v-model="age" :items="itemsAge" label="Âge" @change="applyAge()" />
      </v-col>

      <v-divider vertical />

      <!-- col n° 2 - Caractéristiques et cie -->
      <v-col class="pa-4" sm="12" md="4">
        <!-- Caractéristiques -->
        <v-row>
          <v-col cols="6" v-for="(item, index) in Object.keys(statsDisplayed.caractéristiques)" :key="index">
            <v-text-field v-model.number="statsDisplayed.caractéristiques[item]" :label="item" onkeypress="return event.charCode >= 48" readonly />
          </v-col>
        </v-row>

        <h3 class="text-center pa-4">Total : {{ getTotal }}</h3>

        <v-divider class="pa-4" />

        <!-- autres -->
        <v-row>
          <v-col cols="3" v-for="(item, index) in Object.keys(statsDisplayed.autres)" :key="index">
            <v-text-field v-model="statsDisplayed.autres[item]" :label="item" onkeypress="return event.charCode >= 48" readonly />
          </v-col>
        </v-row>
      </v-col>

      <v-divider vertical />

      <!-- col n° 3 - Compétences -->
      <v-col class="pa-4" sm="12" md="4">
        <v-list v-if="compétences.length">
          <template v-for="(compétence, index) in compétences">
            <v-divider v-if="index !== 0" />

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title v-text="compétence.name" />
              </v-list-item-content>
              <v-list-item-action v-text="compétence.valeur" />
            </v-list-item>
          </template>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, mixins, namespace, Watch } from "nuxt-property-decorator";
import DiceMixin from "~/mixins/dice-mixin";
import RulesMixin from "~/mixins/rules-mixin";
import Competence from "~/models/models/competence";
const competences = namespace("competences");

@Component({})
export default class CallOfCthulhuPage extends mixins(DiceMixin, RulesMixin) {
  orientation: string = "";
  age: string = "";

  statsBase: { caractéristiques: any; autres: any } = { caractéristiques: {}, autres: {} };
  statsDisplayed: { caractéristiques: any; autres: any } = { caractéristiques: {}, autres: {} };
  compétences: Competence[] = [];

  itemsOrientation: string[] = ["Équilibré", "Combat", "Intello"];
  itemsAge: string[] = [
    "15 => 19 :  2 jets pour la chance ; -5 FOR / TAI, -5 EDU",
    "20 => 39 : 1 test expérience en EDU",
    "40 => 49 : 2 tests expériences en EDU ; -5 FOR / CON / DEX ; -5 APP",
    "50 => 59 : 3 tests expériences en EDU ; -10 FOR / CON / DEX ; -10 APP",
    "60 => 69 : 4 tests expériences en EDU ; -20 FOR / CON / DEX ; -15 APP",
    "70 => 79 : 4 tests expériences en EDU ; -40 FOR / CON / DEX ; -20 APP",
    "80 => 89 : 4 tests expériences en EDU ; -80 FOR / CON / DEX ; -25 APP",
  ];

  @competences.Getter
  public getCompetencesCombat!: any;
  @competences.Getter
  public getCompetencesSocial!: any;
  @competences.Getter
  public getCompetencesAutre!: any;
  @competences.Action
  public fetchAllCompetences!: () => void;

  /** */
  public get getTotal(): number {
    return Object.keys(this.statsDisplayed.caractéristiques).reduce((previous, key) => previous + this.statsDisplayed.caractéristiques[key], 0);
  }

  @Watch("statsBase.caractéristiques.constitution", { deep: true })
  public constitutionChanged(): void {
    this.setPV();
  }
  @Watch("statsBase.caractéristiques.dextérité", { deep: true })
  public dexteriteChanged(val: number): void {
    this.setMouvement();
    const newVal = Math.floor(val / 2);
    this.statsBase.autres.esquive = newVal;
    this.statsDisplayed.autres.esquive = newVal;
  }
  @Watch("statsBase.caractéristiques.force", { deep: true })
  public forceChanged(): void {
    this.setMouvement();
    this.setCarrure();
    this.setImpact();
  }
  @Watch("statsBase.caractéristiques.pouvoir", { deep: true })
  public pouvoirChanged(val: number): void {
    this.statsBase.autres.mana = val;
    this.statsBase.autres.sanité = val;
    this.statsDisplayed.autres.mana = val;
    this.statsDisplayed.autres.sanité = val;
  }
  @Watch("statsBase.caractéristiques.taille", { deep: true })
  public tailleChanged(): void {
    this.setMouvement();
    this.setPV();
    this.setCarrure();
    this.setImpact();
  }

  public async mounted(): Promise<void> {
    await this.fetchAllCompetences();
    this.resetForm();
  }

  /** Resets everything in the form */
  public resetForm(): void {
    this.orientation = this.itemsOrientation[0];
    this.age = this.itemsAge[0];

    this.statsBase = this.resetStats();
    this.statsDisplayed = this.resetStats();
  }

  /** Sets the default value for a set of stats */
  private resetStats(): any {
    return {
      caractéristiques: {
        apparence: 50,
        constitution: 50,
        dextérité: 50,
        éducation: 50,
        force: 50,
        intelligence: 50,
        taille: 50,
        pouvoir: 50,
      },
      autres: {
        mouvement: 8,
        chance: 50,
        pv: 10,
        mana: 10,
        sanité: 50,
        impact: 0,
        carrure: 0,
        esquive: 20,
      },
    };
  }

  /** */
  public applyOrientation(): void {
    if (this.orientation === this.itemsOrientation[0]) {
      // Default random
      this.statsBase.caractéristiques.apparence = this.rollDice(3, 6) * 5;
      this.statsBase.caractéristiques.constitution = this.rollDice(3, 6) * 5;
      this.statsBase.caractéristiques.dextérité = this.rollDice(3, 6) * 5;
      this.statsBase.caractéristiques.force = this.rollDice(3, 6) * 5;
      this.statsBase.caractéristiques.pouvoir = this.rollDice(3, 6) * 5;
      this.statsBase.caractéristiques.éducation = (this.rollDice(2, 6) + 6) * 5;
      this.statsBase.caractéristiques.intelligence = (this.rollDice(2, 6) + 6) * 5;
      this.statsBase.caractéristiques.taille = (this.rollDice(2, 6) + 6) * 5;
    } else if (this.orientation === this.itemsOrientation[1]) {
      // Battle
      // We create a random set
      const set = this.getRandomizedSet();

      // We favorise the battle stats
      this.statsBase.caractéristiques.force = this.rollPercentage(75) ? set.shift() : set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.constitution = this.rollPercentage(75) ? set.shift() : set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.taille = this.rollPercentage(75) ? set.shift() : set.splice(Math.random() * set.length, 1)[0];

      this.statsBase.caractéristiques.dextérité = set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.apparence = set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.pouvoir = set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.intelligence = set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.éducation = set.splice(Math.random() * set.length, 1)[0];
    } else {
      // Support
      // We create a random set
      const set = this.getRandomizedSet();

      // We favorise the support stats
      this.statsBase.caractéristiques.éducation = this.rollPercentage(75) ? set.shift() : set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.intelligence = this.rollPercentage(75) ? set.shift() : set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.pouvoir = this.rollPercentage(75) ? set.shift() : set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.apparence = set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.dextérité = set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.taille = set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.constitution = set.splice(Math.random() * set.length, 1)[0];
      this.statsBase.caractéristiques.force = set.splice(Math.random() * set.length, 1)[0];
    }

    // Autres (certains sont calculés automatiquement par des Watchers)
    this.statsBase.autres.chance = this.rollDice(1, 100);

    // We reset the stats
    this.statsDisplayed = this.statsBase;

    this.applyCompétences();
  }

  /** */
  public applyAge(): void {
    // We reset the stats
    this.statsDisplayed = this.statsBase;

    // We get the selected index
    const index = this.itemsAge.indexOf(this.age);

    if (index === 0) {
      // cas spécial : enfant
      if (this.age === this.itemsAge[1]) {
        this.statsDisplayed.caractéristiques.taille -= 5;
      } else if (this.age === this.itemsAge[2]) {
        this.statsDisplayed.caractéristiques.force -= 5;
      } else {
        const rnd = this.rollDice(1, 5);
        this.statsDisplayed.caractéristiques.force -= rnd;
        this.statsDisplayed.caractéristiques.taille -= 5 - rnd;
      }
      this.statsDisplayed.caractéristiques.éducation -= 5;
      this.statsDisplayed.autres.chance = Math.max(this.statsBase.autres.chance, this.rollDice(1, 100));
    } else {
      // Test(s) d'expérience, compris entre 1 et 4
      this.textExpérience(Math.min(index, 4));

      // For index strictly above 1 : lower some stats
      if (index > 1) {
        let baisse = 5;
        for (let i = 2; i < index; i++) {
          baisse = baisse * 2;
        }

        // baisse Mouvement
        this.statsDisplayed.autres.mouvement -= index - 1;
      }

      // baisse d'apparence
      this.statsDisplayed.caractéristiques.apparence -= 5 * (index - 1);
    }
  }

  /** */
  public applyCompétences(): void {
    // On réinitialise les compétences
    this.compétences = [];

    //On récupère l'index d'orientation choisi
    const index = this.itemsOrientation.indexOf(this.orientation);

    // 1 - COMBAT
    // On crée une copie des compétences de combat
    let shuffledCombat = this.shuffleArray([...this.getCompetencesCombat]);
    let rnd = this.rollDice(1, 2);

    // On ajoute 1 ou 2 compétences
    for (let i = 0; i < rnd; i++) {
      let compCombat = shuffledCombat.shift();
      compCombat.valeur = compCombat.min + this.rollDice(1, compCombat.range);
      this.compétences.push(compCombat);
    }

    // 2 - SOCIAL
    const compSocial = this.shuffleArray([...this.getCompetencesSocial]).shift();
    compSocial.valeur = compSocial.min + this.rollDice(1, compSocial.range);
    this.compétences.push(compSocial);

    // 3 - AUTRES
    // On crée une copie des compétences autres, dont on sélectionne entre 5 et 10
    let shuffledAutre = this.shuffleArray([...this.getCompetencesAutre]);
    rnd = 5 + this.rollDice(1, 5);

    // On ajoute 1 ou 2 compétences
    for (let i = 0; i < rnd; i++) {
      let compAutre = shuffledAutre.shift();
      compAutre.valeur = compAutre.min + this.rollDice(1, compAutre.range);
      this.compétences.push(compAutre);
    }
  }

  /** */
  public setMouvement(): void {
    this.statsBase.autres.mouvement = 9;
    if (this.statsBase.caractéristiques.force > this.statsBase.caractéristiques.taille) {
      this.statsBase.autres.mouvement--;
    }
    if (this.statsBase.caractéristiques.dextérité > this.statsBase.caractéristiques.taille) {
      this.statsBase.autres.mouvement--;
    }
  }

  /** */
  public setPV(): void {
    this.statsBase.autres.pv = Math.floor((this.statsBase.caractéristiques.constitution + this.statsBase.caractéristiques.taille) / 10);
    this.statsBase.autres.pv = this.statsDisplayed.autres.pv;
  }

  /** */
  public setCarrure(): void {
    const total = this.statsBase.caractéristiques.force + this.statsBase.caractéristiques.taille;
    const carrure = 2 <= total && total <= 64 ? -2 : 65 <= total && total <= 84 ? -1 : 85 <= total && total <= 124 ? 0 : 125 <= total && total <= 164 ? 1 : 2;

    this.statsBase.autres.carrure = carrure;
    this.statsDisplayed.autres.carrure = carrure;
  }

  /** */
  public setImpact(): void {
    const total = this.statsBase.caractéristiques.force + this.statsBase.caractéristiques.taille;
    const impact = 2 <= total && total <= 64 ? -2 : 65 <= total && total <= 84 ? -1 : 85 <= total && total <= 124 ? 0 : 125 <= total && total <= 164 ? "1D4" : "1D6";

    this.statsBase.autres.impact = impact;
    this.statsDisplayed.autres.impact = impact;
  }

  /** */
  private textExpérience(cpt: number): void {
    for (let i = 0; i < cpt; i++) {
      if (this.rollDice(1, 100) > this.statsDisplayed.caractéristiques.éducation) {
        this.statsDisplayed.caractéristiques.éducation += this.rollDice(1, 10);
      }
    }
  }

 private shuffleArray(arr: unknown[]): any[] {
    return JSON.parse(JSON.stringify(arr)).sort(() => Math.random() - 0.5);
  }

  public head(): { title: string } {
    return { title: "L'appel de Cthulhu" };
  }
}
</script>
