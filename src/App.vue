<template>
  <v-app id="app">
    <v-app-bar
      app
      color="primary"
      dark
      v-if="HomeScreen"
      clas="ma-0 pa-0"
    >
      <div class="d-flex align-center">
        <!-- <v-img
          alt="Bridgepoint Logo"
          class="shrink mr-2"
          contain
          src="./assets/img/bridgepoint.jpeg"
          transition="scale-transition"
          width="150"
        /> -->
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://witty-sea-0c9c28c10.azurestaticapps.net"
        target="_blank"
        text
      >
        <span class="mr-2">Cliente</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

      <v-btn
        href="https://black-rock-02aabc410.azurestaticapps.net"
        target="_blank"
        text
      >
        <span class="mr-2">Agente</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    logo: "",
    HomeScreen: null
  }),
   async created() {
      console.log(this.$route)
      if(this.$route.name === "HomeScreen"){
        this.HomeScreen = true;
      }
    },
};
</script>

<style>
#app {
  background-image: linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%);
   /*  background: white; */
}
.v-toolbar__content {
  padding: 0 !important;
}
</style>