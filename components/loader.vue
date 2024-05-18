<template>
  <div class="text-center">
    <div>
      <v-progress-circular
        class="pa-16"
        color="primary"
        :size="70"
        :width="8"
        indeterminate
      />
    </div>
    <h3 class="ma-8 primary--text font-italic">
      {{ message }}
    </h3>
  </div>
</template>

<script lang="ts">
// Imports
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class LoaderComponent extends Vue {
  @Prop({ required: true }) readonly message: string;
};
</script>
