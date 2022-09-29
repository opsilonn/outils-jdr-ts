<template>
  <v-footer app>
    <span>&copy; {{ new Date().getFullYear() }} - JDR assistant web</span>
  </v-footer>
</template>


<script lang="ts">
// Imports
import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class LayoutFooterComponent extends Vue {
};
</script>
