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
  </v-container>
  
</template>

<script>
import LoadingScreen from "@/components/LoadingScreen";
import { CallClient } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

export default {
  name: "HelloWorld",
  components: {
    LoadingScreen
  },
  data: () => ({
    isLoading: false,
    title: "Comienza ahora",
    subtitulo: "",
    call: "",
    callAgent: "",
    userAccesToken: null,
    idUser: "",
    callButton: null,
    submitToken: null,
    hangUpButton: null,
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

      const response = await fetch(this.endpointApiAuth);
      const data = await response.json();
      this.userAccesToken = data.token;
      console.log(this.userAccesToken);
    },
    refreshToken() {},
    async startAgentCall() {
      console.log("startAgentCall");

      const callClient = new CallClient();
      const userTokenCredential = this.userAccesToken;

      try {
        let tokenCredential = new AzureCommunicationTokenCredential(
          userTokenCredential
        );
        this.callAgent = await callClient.createCallAgent(tokenCredential);
        this.callButton = false;
        this.submitToken = true;
      } catch (error) {
        window.alert("Please submit a valid token!");
      }
    },
    startCall() {
      console.log("startCall");
      // start a call
      //let userToCall = calleeInput.value;
      //let userToCall = {id: '8:echo123'};
      // To call an ACS communication user, use {communicationUserId: 'ACS_USER_ID'}.
      // To call echobot, use {id: '8:echo123'}.
      this.call = this.callAgent.startCall([{ id: "8:echo123" }], {});
      // toggle button states
      this.hangUpButton = false;
      this.callButton = true;
    },
    hangUp() {
      // end the current call
      console.log("hangUp");
      this.call.hangUp({ forEveryone: true });

      // toggle button states
      this.hangUpButton = true;
      this.callButton = false;
      this.submitToken = false;
    },
  },
};
</script>