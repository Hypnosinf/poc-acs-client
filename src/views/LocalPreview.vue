<template>
  <v-container fill-height fluid>
    <v-row align-content="center" justify="center">
      <v-col cols="4">
        <v-card class="mx-auto" max-width="344">
          <v-card-text>
            <div>Word of the Day</div>
            <p class="text-h4 text--primary">el·ee·mos·y·nar·y</p>
            <p>adjective</p>
            <div class="text--primary">
              relating to or dependent on charity; charitable.<br />
              "an eleemosynary educational institution."
            </div>
          </v-card-text>
          <v-card-actions>
            <v-container class="px-0" fluid>
              <v-row>
                <v-col cols="6">
                  <v-switch v-model="switch1" prepend-icon="mdi-video"></v-switch>
                </v-col>
                <v-col cols="6">
                  <v-switch prepend-icon="mdi-microphone " v-model="switch2"></v-switch>
                </v-col>
              </v-row>
            </v-container>
          </v-card-actions>

          <v-expand-transition>
            <v-card
              v-if="reveal"
              class="transition-fast-in-fast-out v-card--reveal"
              style="height: 100%"
            >
              <v-card-text class="pb-0">
                <p class="text-h4 text--primary">Origin</p>
                <p>
                  late 16th century (as a noun denoting a place where alms were
                  distributed): from medieval Latin eleemosynarius, from late
                  Latin eleemosyna ‘alms’, from Greek eleēmosunē ‘compassion’
                </p>
              </v-card-text>
              <v-card-actions class="pt-0">
                <v-btn text color="teal accent-4" @click="reveal = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-expand-transition>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="name"
            :counter="10"
            :rules="nameRules"
            label="Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="E-mail"
            required
          ></v-text-field>

          <!--   <v-select
            v-model="select"
            :items="items"
            :rules="[(v) => !!v || 'Item is required']"
            label="Item"
            required
          ></v-select> -->

          <v-btn
            :disabled="!valid"
            color="success"
            class="mr-4"
            @click="validate"
          >
            Validate
          </v-btn>

          <v-btn color="error" class="mr-4" @click="reset"> Reset Form </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { CallClient } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

export default {
  name: "LocalPreview",
  components: {},
  data: () => ({
    call: "",
    callAgent: "",
    userAccesToken: null,
    switch1: true,
    switch2: true,
    reveal: false,
    valid: true,
    name: "",
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => (v && v.length <= 10) || "Name must be less than 10 characters",
    ],
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    select: null,
    items: ["Item 1", "Item 2", "Item 3", "Item 4"],
  }),
  async created() {
    console.log(
      "At this point, this.property is now reactive and propertyComputed will update."
    );
    let token = await this.$store.getters["acs/getToken"];
    console.log("token", token);
    this.userAccesToken = token;
  },
  methods: {
    validate() {
      this.$refs.form.validate();
    },
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
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