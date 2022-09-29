<template>
  <v-app dark>
    <br />
    <br />
    <br />
    <br />
    <center>
      <!-- Image -->
      <v-img src="/error.jpg" max-height="300" max-width="450" />

      <!-- Blabla error -->
      <h1 class="pa-4">
        Oopsie doopsie, an error occured...
      </h1>

      <!-- Blabla status code -->
      <h2>Status code : {{ error.statusCode }}</h2>

      <!-- Blabla content of the error -->
      <h2 class="font-italic">- {{ getError.message }} -</h2>

      <!-- Link to the Homepage -->
      <NuxtLink to="/">
        <p class="pa-4">Return to Home page</p>
      </NuxtLink>
    </center>
  </v-app>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: null
    }
  },

  computed: {
    /** Returns a complete answer depending on the error's status code */
    getError() {
      const errors = [
        { statusCode: 401, message: "Unauthorized access" },
        { statusCode: 404, message: "Page not found" },
        { statusCode: 500, message: "Internal Server Error" }
      ];

      return (
        errors.find(e => e.statusCode === this.error.statusCode) || {
          statusCode: this.error.statusCode,
          message: "Error"
        }
      );
    }
  },

  head() {
    return { title: this.getError.message };
  }
};
</script>
