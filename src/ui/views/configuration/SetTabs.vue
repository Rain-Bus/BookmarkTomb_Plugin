<template>
  <v-card width="800" class="mx-auto">


    <v-card-title class="text-center justify-center py-6">
      <h1>
        Bookmark Tomb
      </h1>
    </v-card-title>


    <v-tabs v-model="tab">
      <v-tab v-for="item of tabs" :key="item" v-text="item"></v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <user-info></user-info>
      </v-tab-item>
      <v-tab-item>
        <sync-item></sync-item>
      </v-tab-item>
      <v-tab-item>
        <system-setting></system-setting>
      </v-tab-item>
    </v-tabs-items>

  </v-card>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import UserInfo from "@/ui/views/configuration/UserInfo.vue";
import SyncItem from "@/ui/views/configuration/SyncItem.vue";
import SystemSetting from "@/ui/views/configuration/SystemSetting.vue";
@Component({
  components: {SystemSetting, SyncItem, UserInfo}
})
export default class SetTabsComponent extends Vue {
  tab: string = "User Infos"
  tabs = ["User Infos", "Sync Items", "System Sets"]
}
</script>