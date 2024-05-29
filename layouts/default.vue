<template>
  <v-app dark>
    <!-- App bar (navbar) -->
    <LayoutAppBar />

    <!-- Container for Nuxt's page -->
    <v-main class="background">
      <div class="fill-height" fluid>
        <nuxt />
      </div>
    </v-main>

    <!-- footer -->
    <LayoutFooter v-if="showFooter" />
  </v-app>
</template>

<script lang="ts">
import LayoutAppBar from "@/components/layout-appbar.vue";
import LayoutFooter from "@/components/layout-footer.vue";
import { Component, Vue, Watch } from "vue-property-decorator";
import EnumRouter from "~/models/enums/EnumRouter";
import NavItem from "~/models/models/nav-item";

@Component({
  components: { LayoutAppBar, LayoutFooter },
})
export default class DefaultLayout extends Vue {
  src: string = "";
  srcDefault: string = "";
  showFooter: boolean = false;

  @Watch("$route")
  onRouteChanged() {
    this.setSourceImage();
  }

  mounted() {
    this.setSourceImage();
  }

  /** Sets the value of the image to display, if any */
  setSourceImage(): void {
    const navItem: NavItem = EnumRouter.find((item: NavItem) => item.route === this.$route.path);
    this.src = navItem?.src || this.srcDefault;
  }
}
</script>
