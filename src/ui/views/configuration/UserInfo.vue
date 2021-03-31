<template>
  <v-container>

    <v-row no-gutters>
      <v-avatar height="100" width="100" class="mx-auto">
        <img :src="avatarImg" :alt="userInfo.nickname === undefined ? userInfo.username : userInfo.nickname">
      </v-avatar>
    </v-row>

    <v-row no-gutters>
      <v-col md="6" offset-md="3">
        <read-only-text-field
            label="Nickname"
            :value="userInfo.nickname === undefined ? userInfo.username : userInfo.nickname"
        ></read-only-text-field>
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-n3">
      <v-col md="6" offset-md="3">
        <read-only-text-field
            label="Email"
            :value="userInfo.email"
        ></read-only-text-field>
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-n3">
      <v-col md="6" offset-md="3">
        <read-only-text-field
            label="Server URL"
            :value="serverUrl"
        ></read-only-text-field>
      </v-col>
    </v-row>

    <!--Logout dialog-->
    <v-row no-gutters justify="center">
      <v-dialog
          v-model="showLogoutDialog"
          max-width="500"
          persistent
      >
        <template v-slot:activator="{on, attrs}">
          <v-btn
              outlined
              v-on="on"
              v-bind="attrs"
              color="red"
          >Logout</v-btn>
        </template>
        <v-card>
          <v-card-title>
            Will delete all the sync items and the configurations, which can't be used when login again.
          </v-card-title>
          <v-card-actions class="justify-space-around">
            <v-btn
                outlined
                color="red"
                @click="logout"
            >Confirm</v-btn>
            <v-btn
                outlined
                color="blue"
                @click="showLogoutDialog = !showLogoutDialog"
            >Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {getAvatarAPI, getUserInfoAPI, logoutAPI} from "@/api/user";
import {UserInfo} from "@/model/request/user";
import ReadOnlyTextField from "@/ui/components/configuration/ReadOnlyTextField.vue";
import {clearBookmark} from "@/lib/storage/bookmark";
import {clearCollection} from "@/lib/storage/collection";
import {clearSystemInfo} from "@/lib/storage/systemInfo";
import {clearSyncItem} from "@/lib/storage/syncItem";
import {clearOldLocalTree} from "@/lib/storage/oldTrees";
import {browser} from "webextension-polyfill-ts";
@Component({
  components: {ReadOnlyTextField}
})
export default class UserInfoComponent extends Vue {
  avatarImg = ""
  showLogoutDialog = false
  userInfo: UserInfo = new UserInfo()
  serverUrl = localStorage.getItem("baseURL")
  async created() {
    this.avatarImg = (await getAvatarAPI()).data
    this.userInfo = (await getUserInfoAPI()).data
  }

  async logout() {
    await logoutAPI()
    localStorage.clear()
    await clearSystemInfo()
    await clearCollection()
    await clearBookmark()
    await clearSyncItem()
    await clearOldLocalTree()
    await browser.tabs.remove((await browser.tabs.getCurrent()).id)
  }

}
</script>
