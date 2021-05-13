<template>
  <v-card width="500" max-height="590">


    <v-card-title class="justify-space-between">
      <v-tooltip bottom>
        <template v-slot:activator="{on, attrs}">
          <v-btn
              icon
              v-on="on"
              v-bind="attrs"
              to="push"
              target="_blank"
              :disabled="baseURL===null || userToken===null"
          >
            <v-icon>mdi-upload-outline</v-icon>
          </v-btn>
        </template>
        <span>Push a local collection to server</span>
      </v-tooltip>
      Bookmark Tomb
      <v-tooltip bottom>
        <template v-slot:activator="{on, attrs}">
          <v-btn
              icon
              v-on="on"
              v-bind="attrs"
              to="pull"
              target="_blank"
              :disabled="baseURL===null || userToken===null"
          >
            <v-icon>mdi-download-outline</v-icon>
          </v-btn>
        </template>
        <span>Pull a server collection to local</span>
      </v-tooltip>
    </v-card-title>


    <v-divider></v-divider>


    <v-card-subtitle>
      <v-carousel
          cycle
          vertical
          height="20"
          interval="4000"
          hide-delimiters
          :show-arrows="false"
      >
        <v-carousel-item v-for="item of tips" :key="item" v-html="item"></v-carousel-item>
      </v-carousel>
    </v-card-subtitle>


    <v-divider></v-divider>


    <v-card-text>
      <!--Show when not init-->
      <v-container
          v-if="baseURL===null || userToken===null"
          class="d-flex align-center justify-center"
          style="height: 395px;">
        <v-tooltip top>
          <template v-slot:activator="{on, attrs}">
            <v-btn
                icon
                v-on="on"
                v-bind="attrs"
                to="connect"
                target="_blank"
            >
              <v-icon>mdi-login-variant</v-icon>
            </v-btn>
          </template>
          <span>Please first login to sever.</span>
        </v-tooltip>
      </v-container>
      <!--Show when init and not have sync item-->
      <v-container
          v-else-if="syncItems.length === 0"
          class="d-flex align-center justify-center"
          style="height: 395px;">
        <p class="subtitle-1">
          You can add sync item by <v-icon>mdi-upload-outline</v-icon> or <v-icon>mdi-download-outline</v-icon>!
        </p>
      </v-container>
      <!--Show sync items-->
      <v-container
          v-else
          style="height: 395px; overflow-y: scroll">
        <sync-simple-info v-for="item of syncItems" :key="item.syncId" :sync-item="item"></sync-simple-info>
      </v-container>
    </v-card-text>


    <v-divider></v-divider>


    <v-footer class="justify-space-between">
      Server Version: {{serverVersion}}
      <v-btn
          icon
          to="setting"
          target="_blank"
          :disabled="baseURL===null || userToken===null"
      >
        <v-icon>
          mdi-cog-outline
        </v-icon>
      </v-btn>
      Plugin Version: {{pluginVersion}}
    </v-footer>


  </v-card>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import SyncSimpleInfo from "@/ui/components/popup/SyncSimpleInfo.vue";
import {SyncItem} from "@/model/storage/SyncItem";
import {listSyncItems} from "@/lib/storage/syncItem";
import Config from "@/model/constant/settings"
import {selectSystemInfo} from "@/lib/storage/systemInfo";

@Component({
  components: {SyncSimpleInfo}
})
export default class PopupComponent extends Vue {

  baseURL = localStorage.getItem("baseURL")
  userToken = localStorage.getItem("BookmarkTombToken")
  serverVersion: string = null
  pluginVersion = Config.version
  syncItems = new Array<SyncItem>()
  tips = ['<span>Get help from <a href="https://blog.fallen-angle.com/BookmarkTomb_Docs/" target="_blank" class="text-decoration-none">our page</a></span>',
    "Download from google"]

  async created() {
    this.syncItems = await listSyncItems()
    this.serverVersion = <string>((await selectSystemInfo("serverVersion")).get("serverVersion"))
  }

}
</script>