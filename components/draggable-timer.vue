<template>
  <!-- Draggable timer -->
  <v-card max-width="600" :id="ID_TIMER" @mousedown="beginDragging">
    <v-toolbar flat dense>
      <v-toolbar-title>
        <span class="subheading">MINUTEUR</span>
      </v-toolbar-title>
    </v-toolbar>

    <v-card-text>
      <!-- text && button -->
      <v-row>
        <v-col class="text-left">
          <span class="text-h5 font-weight-light"> {{ displayedCpt }} </span>
          <v-fade-transition>
            <v-avatar
              v-if="isPlaying"
              :style="{
                animationDuration: '1s',
              }"
              class="mb-1 primary v-avatar--metronome"
              size="12"
            ></v-avatar>
          </v-fade-transition>
        </v-col>

        <v-col class="text-right">
          <v-btn class="primary" depressed fab @click="startOrPause()">
            <v-icon large>
              {{ isPlaying ? "mdi-pause" : "mdi-play" }}
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <!-- slider -->
      <v-slider v-model="cpt" track-color="grey" min="0" max="300" hide-details>
        <template v-slot:prepend>
          <v-icon @click="remove"> mdi-minus </v-icon>
        </template>

        <template v-slot:append>
          <v-icon @click="add"> mdi-plus </v-icon>
        </template>
      </v-slider>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
// Imports
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class DraggableTimerComponent extends Vue {
  ID_TIMER: string = "draggable_timer";
  pos1: number = 0;
  pos2: number = 0;
  pos3: number = 0;
  pos4: number = 0;
  timer: HTMLElement;
  cpt: number = 60;
  updateCptInterval: ReturnType<typeof setTimeout>;
  isPlaying: boolean = false;

  get displayedCpt(): string {
    const min = Math.floor(this.cpt / 60);
    const sec = String(this.cpt % 60).padStart(2, "0");
    return min != 0 ? `${min}m:${sec}s` : `${sec}s`;
  }

  get animationDuration(): string {
    return `1s`;
  }

  mounted(): void {
    this.timer = document.getElementById(this.ID_TIMER);
  }

  remove(): void {
    const toRemove = this.cpt % 5 || 5;
    this.cpt -= toRemove;
  }

  add(): void {
    const toAdd = 5 - (this.cpt % 5);
    this.cpt += toAdd;
  }

  /** Commence ou suspend le timer */
  startOrPause(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      const that = this;
      this.updateCptInterval = setInterval(() => {
        that.cpt--;
        if (this.cpt <= 0) {
          this.isPlaying = false;
          clearInterval(this.updateCptInterval);
        }
      }, 1000);
    } else {
      clearInterval(this.updateCptInterval);
    }
  }

  /** Le timer commence à être déplacé. Si sélectionné par un endroit valable, on initialise les valeur pour le draggable */
  beginDragging(e: any): void {
    if (["v-btn", "v-icon", "v-slider"].some((className) => e.target.className.includes(className))) {
      return;
    }

    e = e || window.event;
    e.preventDefault();

    // get the mouse cursor position at startup:
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    document.onmouseup = this.stopDragging;
    document.onmousemove = this.isDragging;
  }

  /** Le Timer est en train d'être déplacé, on recalcule sa position à chaque mouvement */
  isDragging(e: MouseEvent): void {
    e.preventDefault();
    // calculate the new cursor position:
    this.pos1 = this.pos3 - e.clientX;
    this.pos2 = this.pos4 - e.clientY;
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    // set the element's new position:
    this.timer.style.top = this.timer.offsetTop - this.pos2 + "px";
    this.timer.style.left = this.timer.offsetLeft - this.pos1 + "px";
  }

  /** On arrête de déplacer le timer, on défausse les variables utilisées */
  stopDragging(): void {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
</script>

<style scoped>
#draggable_timer {
  border-style: groove;
  position: absolute;
  z-index: 9;
  text-align: center;
  cursor: move;
  width: 250px;
  top: 25%;
  left: 25%;
}

#timer_picker {
  cursor: grab;
}

@keyframes metronome-example {
  from {
    transform: scale(0.5);
  }

  to {
    transform: scale(1);
  }
}

.v-avatar--metronome {
  animation-name: metronome-example;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
</style>
