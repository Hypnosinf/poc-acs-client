<template>
  <v-container fill-height fluid>
    <v-row align-content="center" justify="center">
      <v-col cols="4">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-card class="mx-auto" max-width="460" v-show="LocalVideoActive">
                <div ref="localVideoContainer" style="width: 100%">
                  Local video stream:
                </div>
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card class="mx-auto" max-width="460"  v-show="RemoteVideoActive">
                <div ref="remoteVideoContainer" style="width: 100%">
                  Remote video stream:
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>

      <v-col cols="4">
        <v-form ref="form" v-model="valid" lazy-validation>
          
          <v-btn
            color="success"
            class="mr-4"
            @click="startCall"
            :disabled="startCallButton"
          >
            Llamar
          </v-btn>
          <v-btn
            color="error"
            class="mr-4"
            @click="hangUpCall"
            :disabled="hangUpCallButton"
          >
           Colgar
          </v-btn>
         
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const {
  CallClient,
  VideoStreamRenderer,
  LocalVideoStream,
} = require("@azure/communication-calling");
const {
  AzureCommunicationTokenCredential,
} = require("@azure/communication-common");
const { AzureLogger, setLogLevel } = require("@azure/logger");

export default {
  name: "LocalPreview",
  components: {},
  data: () => ({
    LocalVideoActive: false,
    RemoteVideoActive: false,
    localVideoContainer: null,
    remoteVideoContainer: null,
    call: null,
    callAgent: null,
    deviceManager: null,
    incomingCall: null,
    userAccesToken: null,
    calleeAcsUserId: null,
    tokenExpiresOn: null,
    acceptCallButton: true,
    startCallButton: true,
    hangUpCallButton: true,
    initializeCallAgentButton: false,
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
    let token = await this.$store.getters["acs/getToken"];
    //let identityId = await this.$store.getters["acs/getIdentityId"];
    let expiresOn = await this.$store.getters["acs/getExpiresOn"];

    this.userAccesToken = token;
    //this.calleeAcsUserId = identityId;
    this.tokenExpiresOn = expiresOn;

    await this.initializeCallAgent();
  },
  async mounted() {
    this.localVideoContainer = this.$refs.localVideoContainer;
    this.remoteVideoContainer = this.$refs.remoteVideoContainer;
  },
  methods: {
    async initializeCallAgent() {
      console.log("initializeCallAgent");

      const callClient = new CallClient();
      const userTokenCredential = this.userAccesToken;

      try {
        let tokenCredential = new AzureCommunicationTokenCredential(
          userTokenCredential
        );
        this.callAgent = await callClient.createCallAgent(tokenCredential);

        this.deviceManager = await callClient.getDeviceManager();
        console.log("this.deviceManager", this.deviceManager);
        await this.deviceManager.askDevicePermission({ video: true });
        await this.deviceManager.askDevicePermission({ audio: true });

        this.callAgent.on("incomingCall", async (args) => {
          try {
            console.log("incomingCall");
            this.incomingCall = args.incomingCall;
            this.acceptCallButton = false;
            this.startCallButton = true;
          } catch (error) {
            console.error(error);
          }
        });

        let agentResponse = await this.getAvailableAgent();
        this.calleeAcsUserId = agentResponse.identityId;
        this.startCallButton = false;
        this.initializeCallAgentButton = true;
      } catch (error) {
        window.alert("Please submit a valid token!");
      }
    },
    async getAvailableAgent() {
      try {
        let response = await fetch(
          "https://app-service-poc-jaibo.azurewebsites.net/api/Agent/GetAvailableAgent"
        );
        let agent = await response.json();
        console.log("AGENT", agent);
        return agent;
      } catch (error) {
        console.error(error);
      }
    },
    async startCall() {
      console.log("startCall");
      try {
        const localVideoStream = await this.createLocalVideoStream();
        console.log("localVideoStream", localVideoStream);
        const videoOptions = localVideoStream
          ? { localVideoStreams: [localVideoStream] }
          : undefined;
        console.log("videoOptions", videoOptions);
        this.call = this.callAgent.startCall(
          [{ communicationUserId: this.calleeAcsUserId }],
          { videoOptions }
        );
        // Subscribe to the call's properties and events.
        this.subscribeToCall(this.call);
      } catch (error) {
        console.error(error);
      }
    },
    async acceptCall() {
      console.log("acceptCall");
      try {
        const localVideoStream = await this.createLocalVideoStream();
        const videoOptions = localVideoStream
          ? { localVideoStreams: [localVideoStream] }
          : undefined;
        this.call = await this.incomingCall.accept({ videoOptions });
        // Subscribe to the call's properties and events.
        this.subscribeToCall(this.call);
      } catch (error) {
        console.error(error);
      }
    },
    async subscribeToCall(call) {
      console.log(`subscribeToCall: ${call}`);
      try {
        // Inspect the initial call.id value.
        console.log(`Call Id: ${call.id}`);
        //Subsribe to call's 'idChanged' event for value changes.
        call.on("idChanged", () => {
          console.log(`Call Id changed: ${call.id}`);
        });

        // Inspect the initial call.state value.
        console.log(`Call state: ${call.state}`);
        // Subscribe to call's 'stateChanged' event for value changes.
        call.on("stateChanged", async () => {
          console.log(`Call state changed: ${call.state}`);
          if (call.state === "Connected") {
            //connectedLabel.hidden = false;
            this.acceptCallButton = true;
            this.startCallButton = true;
            this.hangUpCallButton = false;
            this.startVideoButton = false;
            this.stopVideoButton = false;
          } else if (call.state === "Disconnected") {
            //connectedLabel.hidden = true;
            this.startCallButton = false;
            this.hangUpCallButton = true;
            this.startVideoButton = true;
            this.stopVideoButton = true;
            console.log(
              `Call ended, call end reason={code=${call.callEndReason.code}, subCode=${call.callEndReason.subCode}}`
            );
          }
        });

        call.localVideoStreams.forEach(async (lvs) => {
          this.localVideoStream = lvs;
          await this.displayLocalVideoStream();
        });
        call.on("localVideoStreamsUpdated", (e) => {
          e.added.forEach(async (lvs) => {
            this.localVideoStream = lvs;
            await this.displayLocalVideoStream();
          });
          e.removed.forEach((lvs) => {
            this.removeLocalVideoStream();
          });
        });

        // Inspect the call's current remote participants and subscribe to them.
        call.remoteParticipants.forEach((remoteParticipant) => {
          this.subscribeToRemoteParticipant(remoteParticipant);
        });
        // Subscribe to the call's 'remoteParticipantsUpdated' event to be
        // notified when new participants are added to the call or removed from the call.
        call.on("remoteParticipantsUpdated", (e) => {
          // Subscribe to new remote participants that are added to the call.
          e.added.forEach((remoteParticipant) => {
            this.subscribeToRemoteParticipant(remoteParticipant);
          });
          // Unsubscribe from participants that are removed from the call
          e.removed.forEach((remoteParticipant) => {
            console.log("Remote participant removed from the call.");
          });
        });
      } catch (error) {
        console.error(error);
      }
    },
    subscribeToRemoteParticipant(remoteParticipant) {
      try {
        // Inspect the initial remoteParticipant.state value.
        console.log(`Remote participant state: ${remoteParticipant.state}`);
        // Subscribe to remoteParticipant's 'stateChanged' event for value changes.
        remoteParticipant.on("stateChanged", () => {
          console.log(
            `Remote participant state changed: ${remoteParticipant.state}`
          );
        });

        // Inspect the remoteParticipants's current videoStreams and subscribe to them.
        remoteParticipant.videoStreams.forEach((remoteVideoStream) => {
          this.subscribeToRemoteVideoStream(remoteVideoStream);
        });
        // Subscribe to the remoteParticipant's 'videoStreamsUpdated' event to be
        // notified when the remoteParticiapant adds new videoStreams and removes video streams.
        remoteParticipant.on("videoStreamsUpdated", (e) => {
          // Subscribe to new remote participant's video streams that were added.
          e.added.forEach((remoteVideoStream) => {
            this.subscribeToRemoteVideoStream(remoteVideoStream);
          });
          // Unsubscribe from remote participant's video streams that were removed.
          e.removed.forEach((remoteVideoStream) => {
            console.log("Remote participant video stream was removed.");
          });
        });
      } catch (error) {
        console.error(error);
      }
    },

    async subscribeToRemoteVideoStream(remoteVideoStream) {
      // Create a video stream renderer for the remote video stream.
      let videoStreamRenderer = new VideoStreamRenderer(remoteVideoStream);
      let view;
      const renderVideo = async () => {
        try {
          // Create a renderer view for the remote video stream.
          view = await videoStreamRenderer.createView();
          // Attach the renderer view to the UI.
          this.RemoteVideoActive = true;
          this.remoteVideoContainer.appendChild(view.target);
        } catch (e) {
          console.warn(
            `Failed to createView, reason=${e.message}, code=${e.code}`
          );
        }
      };

      remoteVideoStream.on("isAvailableChanged", async () => {
        // Participant has switched video on.
        if (remoteVideoStream.isAvailable) {
          await renderVideo();

          // Participant has switched video off.
        } else {
          if (view) {
            view.dispose();
            view = undefined;
          }
        }
      });

      // Participant has video on initially.
      if (remoteVideoStream.isAvailable) {
        await renderVideo();
      }
    },

    async startVideo() {
      try {
        this.localVideoStream = await this.createLocalVideoStream();
        await this.call.startVideo(this.localVideoStream);
      } catch (error) {
        console.error(error);
      }
    },

    async stopVideo() {
      try {
        await this.call.stopVideo(this.localVideoStream);
      } catch (error) {
        console.error(error);
      }
    },

    async createLocalVideoStream() {
      const camera = (await this.deviceManager.getCameras())[0];
      if (camera) {
        return new LocalVideoStream(camera);
      } else {
        console.error(`No camera device found on the system`);
      }
    },

    async displayLocalVideoStream() {
      console.log("displayLocalVideoStream");
      try {
        this.localVideoStreamRenderer = new VideoStreamRenderer(
          this.localVideoStream
        );
        const view = await this.localVideoStreamRenderer.createView();
        
        this.LocalVideoActive = true;
        this.localVideoContainer.appendChild(view.target);
      } catch (error) {
        console.error(error);
      }
    },

    // Remove your local video stream preview from your UI
    async removeLocalVideoStream() {
      try {
        this.localVideoStreamRenderer.dispose();
         this.LocalVideoActive = false;
      } catch (error) {
        console.error(error);
      }
    },

    async hangUpCall() {
      // end the current call
      await this.call.hangUp();
    },
  }, //end methods
};
</script>