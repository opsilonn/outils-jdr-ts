<template>
  <v-container>
    <v-row>
      <v-col v-for="(item, i) in EnumRouter" :key="i" class="d-flex child-flex">
        <v-card class="zoom-sm" max-width="374" :to="item.route">
          <v-img :src="item.src" contains />

          <v-divider class="mx-4" />

          <v-card-title>{{ item.title }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { EnumRouter } from "@/models/enums";
import { Component, Vue } from 'nuxt-property-decorator';

@Component({})
export default class DefaultLayout extends Vue {
  EnumRouter = EnumRouter;

  public head(): { title: string } {
    return { title: "index" };
  }
};
</script>
