<template>
  <v-container fill-height fluid>
    <v-row>
      <v-col>
        <v-card class="mx-auto" max-width="344" outlined>
          <v-list-item three-line>
            <v-list-item-content>
              
              <v-list-item-title class="text-h5 mb-1">
                {{title}}
              </v-list-item-title>
              <v-list-item-subtitle
                >Greyhound divisely hello coldly
                fonwderfully</v-list-item-subtitle
              >
            </v-list-item-content>

            <v-list-item-avatar tile size="80">
              <v-img src="../assets/img/support_agent.png"></v-img>
            </v-list-item-avatar>
          </v-list-item>

          <v-card-actions>
            <v-btn icon color="success" @click="login">
                  <v-icon x-large>mdi-phone</v-icon>
                </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <LoadingScreen v-if="isLoading"></LoadingScreen>
    <v-snackbar v-model="snackbar" :multi-line="multiLine">
      {{ text }}
        <template v-slot:action="{ attrs }">
          <v-btn color="red" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
    </v-snackbar>
  </v-container>
  
</template>

<script>
import LoadingScreen from "@/components/LoadingScreen";

export default {
  name: "HomeScreen",
  components: {
    LoadingScreen
  },
  data: () => ({
    multiLine: true,
    snackbar: false,
    text: `Ocurrio un error, probar nuevamente`,
    title: "Comenzar llamada",
    isLoading: false,
    userAccesToken: null,
    endpointApiAuth: "https://localhost:44301/api/Auth/GetToken",
  }),
  async created() {
    console.log(
      "At this point, this.property is now reactive and propertyComputed will update."
    );
  },
  methods: {
    async login() {
      console.log("login");
      this.userAccesToken = null;

      try {
        this.isLoading = true;

        const response = await fetch(this.endpointApiAuth);
        const data = await response.json();
        console.log("dataResponse", data);
        this.userAccesToken = data.token;

        await this.$store.dispatch('acs/setToken', this.userAccesToken)
        console.log(this.userAccesToken);
        this.$router.push('local-preview')

        this.isLoading = false;
      } catch (error) {
        this.isLoading = false;
        this.snackbar = true;
      }

      console.log("store", this.$store);
      
     
    }
  },
};
</script>