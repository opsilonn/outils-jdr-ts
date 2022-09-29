<template>
  <v-container>
    Template
  </v-container>
</template>

<script lang="ts">
  import { Component, Vue } from "nuxt-property-decorator";
  
  @Component({})
  export default class TemplatePage extends Vue {
  transition: "slide-bottom";

  head() {
    return { title: "" };
  }
};
</script>
