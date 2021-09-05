<template>
  <v-container fill-height fluid>
    <v-row align="center" justify="center">
      <v-col>
        <v-card flat>
          <v-card-title class="headline justify-center pa-0 mb-4">Azure Communication Services</v-card-title>
          <v-card-text class="py-0">
            <v-layout justify-center>
              <v-flex sm8 lg6 xl5>
                <v-text-field label="User Acces Token" v-model="userAccesToken" autofocus></v-text-field>
                <v-text-field label="Id usuario a llamar" v-model="idUser"></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-layout justify-center>
              <v-flex sm8 lg6 xl5>
                <v-layout>
                  <v-btn icon color="success" @click="login">
                    <v-icon>mdi-fingerprint</v-icon>
                  </v-btn>
                  <v-btn icon color="success" @click="refreshToken">
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
                  <v-btn icon color="primary" @click="startAgentCall">
                    <v-icon>mdi-spellcheck</v-icon>
                  </v-btn>
                  <v-btn icon color="primary" @click="startCall">
                    <v-icon>mdi-phone</v-icon>
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn type="submit" color="secondary" @click="hangUp" depressed>Finalizar</v-btn>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-col>  
    </v-row> 
  </v-container>
</template>

<script>
import { CallClient } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

  export default {
    name: 'HelloWorld',
    data: () => ({
      call:"",
      callAgent: "",
      userAccesToken: null,
      idUser:"",
      callButton: null,
      submitToken: null,
      hangUpButton: null,
      endpointApiAuth: "https://localhost:44301/api/Auth/GetToken"
    }),
    async created() {
      console.log('At this point, this.property is now reactive and propertyComputed will update.')
      
    },
    methods: {
      async login(){
        console.log("login");
        this.userAccesToken = null;

        const response = await fetch(this.endpointApiAuth);
        const data = await response.json();
        this.userAccesToken = data.token;
        console.log(this.userAccesToken);
      },
      refreshToken(){

      },
      async startAgentCall(){
        console.log("startAgentCall");

        const callClient = new CallClient(); 
        const userTokenCredential = this.userAccesToken;

        try {
          let tokenCredential = new AzureCommunicationTokenCredential(userTokenCredential);
          this.callAgent = await callClient.createCallAgent(tokenCredential);
          this.callButton = false;
          this.submitToken = true;
        } catch(error) {
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
        this.call = this.callAgent.startCall([{ id: '8:echo123' }],{});
        // toggle button states
        this.hangUpButton = false;
        this.callButton = true;
      },
      hangUp(){
        // end the current call
        console.log("hangUp");
        this.call.hangUp({ forEveryone: true });

        // toggle button states
        this.hangUpButton = true;
        this.callButton = false;
        this.submitToken = false;
      }
  },
  }
</script>