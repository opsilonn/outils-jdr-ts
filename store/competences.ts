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
    return this.competences.filter((_) => _.isCombat)
  }
  get getCompetencesSocial(): Competence[] {
    return this.competences.filter((_) => _.isSocial)
  }
  get getCompetencesAutre(): Competence[] {
    return this.competences.filter((_) => !_.isCombat && !_.isSocial)
  }
  
  @Mutation
  addCompetence(competence: Competence): void {
    const index: number = this.competences.findIndex((_) => _.id === competence.id);
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
    competences.forEach((_: Competence) => this.context.commit("addCompetence", _));
  }
}
