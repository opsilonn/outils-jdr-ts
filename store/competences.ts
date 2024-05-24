import axios from 'axios';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import Competence from '~/models/models/competence';

@Module({
  // Ne pas remplir le champ "name", car pour X raison ça cause l'erreur ERR_STORE_NOT_PROVIDED
  stateFactory: true,
  namespaced: true
})
export default class CompetenceStore extends VuexModule {
  public competences: Competence[] = [];

  get getCompetencesCombat(): Competence[] {
    return this.competences.filter((competence: Competence) => competence.isCombat)
  }
  get getCompetencesSocial(): Competence[] {
    return this.competences.filter((competence: Competence) => competence.isSocial)
  }
  get getCompetencesAutre(): Competence[] {
    return this.competences.filter((competence: Competence) => !competence.isCombat && !competence.isSocial)
  }
  
  @Mutation
  addCompetence(competence: Competence): void {
    const index: number = this.competences.findIndex((c: Competence) => c.id === competence.id);
    if (index < 0) {
      this.competences.push(competence);
    } else {
      this.competences[index] = competence;
      this.competences = [...this.competences];
    }
  }

  @Action({rawError: true})
  async fetchAllCompetences(): Promise<void> {
    const competences: Competence[] = (await axios.get("/api/competences")).data;
    competences.forEach((competence: Competence) => this.context.commit("addCompetence", competence));
  }
}
