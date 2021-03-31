<template>
  <div>
    <v-card class="mx-auto my-12" width="400">


      <v-card-title>
        <v-icon large left>
          mdi-transit-connection-variant
        </v-icon>
        <span class="title font-weight-light">Connect To Server</span>
      </v-card-title>


      <v-card-text class="headline font-weight-bold">
        <v-col>

          <v-row>
            <v-text-field label="Server URL" v-model="baseURL" placeholder="e.g., http(s)://www.bookmark-tomb.com:8081"></v-text-field>
          </v-row>

          <v-row>
            <v-btn
              class="mx-auto"
              color="success"
              :loading="loading"
              @click="connectServer"
            >
              Connect
            </v-btn>
          </v-row>

        </v-col>
      </v-card-text>


    </v-card>


    <v-snackbar color="orange" v-model="snackbar" :timeout="timeout">
      The server URL is not correct!

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>


  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {PublicSystemInfo} from "@/model/request/public";
import request from "@/lib/instance/request";
import {Component} from "vue-property-decorator";
import {getSystemInfoAPI} from "@/api/public";

@Component
export default class ConnectComponent extends Vue {
  baseURL = "";
  snackbar = false;
  loading = false;
  timeout = 2000;

  async connectServer() {
    this.loading = true;
    await getSystemInfoAPI(this.baseURL).then(async (resp) => {
        let data: PublicSystemInfo = resp.data
        if (data.name != "bookmark_tomb") {
          this.loading = false;
          this.snackbar = true;
        }
        localStorage.setItem("baseURL", this.baseURL)
        request.defaults.baseURL = this.baseURL;
        await this.$router.push("/login");
      })
      .catch(() => {
        this.loading = false;
        this.snackbar = true;
      });
  }
}
</script>

<style></style>
