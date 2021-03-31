<template>
  <v-container>

    <value-setting
        label="Will detect the update from server every %d minutes."
        :min="5"
        :max="360"
        :value.sync="updateInterval"
    ></value-setting>

    <v-divider></v-divider>

    <value-setting
        label="Will delete the history trees which saved %d days ago."
        :min="15"
        :max="360"
        :value.sync="historySaveDays"
    ></value-setting>

    <v-divider></v-divider>

    <v-row class="my-2" justify="center">
      <v-btn outlined @click="saveSettings" color="blue">Save</v-btn>
    </v-row>
    
  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import ValueSetting from "@/ui/components/configuration/ValueSetting.vue";
import Config from "@/model/constant/settings"

@Component({
  components: {ValueSetting}
})
export default class SystemSettingComponent extends Vue {
  updateInterval = parseInt(localStorage.getItem("updateInterval") ?? Config.updateInterval.toString()) / 60000
  historySaveDays = parseInt(localStorage.getItem("historySaveDays") ?? Config.historySaveDays.toString())

  saveSettings() {
    localStorage.setItem("updateInterval", (this.updateInterval * 60000).toString())
    localStorage.setItem("historySaveDays", this.historySaveDays.toString())
  }
}
</script>