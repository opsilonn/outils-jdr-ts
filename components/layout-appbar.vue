<template>
  <div>
    <!-- Navigation Drawer -->
    <v-navigation-drawer :mini-variant="miniVariant" clipped fixed app>
      <v-list>
        <v-list-item v-for="(item, i) in EnumRouter" :key="i" :to="item.route" class="zoom-sm" router exact>
          <v-list-item-avatar>
            <v-img :src="item.src" max-height="30" max-width="30" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>

        <v-divider />

        <!-- Bouton fixe pour appeler le timer -->
        <v-list-item class="zoom-sm" exact>
          <v-list-item-avatar @click="showTimer = !showTimer">
            <v-icon> mdi-timer </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-layout justify-center>
              <v-flex xs12 md2>
                <v-switch v-model="showTimer" inset />
              </v-flex>
            </v-layout>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- AppBar -->
    <v-app-bar clipped-left fixed app>
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? "right" : "left"}` }}</v-icon>
      </v-btn>

      <router-link class="text-decoration-none" to="/">
        <v-toolbar-title class="zoom-sm" v-text="'Assistant JDR'" />
      </router-link>
      <v-spacer />
    </v-app-bar>

    <DraggableTimerComponent v-if="showTimer" />
  </div>
</template>

<script lang="ts">
// Imports
import DraggableTimerComponent from "@/components/draggable-timer.vue";
import { EnumRouter } from "@/models/enums";
import { Vue, Component } from 'nuxt-property-decorator';

@Component({
  components: { DraggableTimerComponent },
})
export default class DefaultLayout extends Vue {
    miniVariant: boolean = true;
    showTimer: boolean = false;
    EnumRouter = EnumRouter;
};
</script>

<style>
/* Changes the mouse's cursor on Pointer */
.pointer {
  cursor: pointer;
}

/* Title */
h1,
h2 {
  color: #e9c490;
}

/* No underline effect for NuxtLink (does not work) */
NuxtLink {
  text-decoration: none;
}

/* Zoom effect when overing */
.zoom {
  transition: transform 0.2s;
}
.zoom:hover {
  transform: scale(1.2);
}
.zoom-sm {
  transition: transform 0.2s;
}
.zoom-sm:hover {
  transform: scale(1.1);
}
.zoom-xs {
  transition: transform 0.2s;
}
.zoom-xs:hover {
  transform: scale(1.05);
}
</style>
