<template>
  <v-card class="mt-3">


    <v-card-title>
      <v-row>

        <v-col cols="10">
          <v-icon
              left
          >mdi-cloud-sync-outline</v-icon>
          <span class="title font-weight-light" v-text="syncItem.syncName"></span>
        </v-col>

        <v-col cols="2">
          <v-switch
              dense
              class="mt-1 pt-0"
              v-model="syncStatus"
              @change="changeSyncStatus"
          ></v-switch>
        </v-col>

      </v-row>
    </v-card-title>


    <v-card-text>
      <read-only-text-field
          label="Last Update Time"
          :hint="errorMap.get(syncItem.errorFlag)"
          :value="syncItem.serverModifyTime.toLocaleString()"
          :append-icon-color="syncItem.errorFlag === undefined ? 'green' : 'red'"
          :append-inner-icon="syncItem.errorFlag === undefined ? 'mdi-sync' : 'mdi-sync-alert'"
      ></read-only-text-field>
    </v-card-text>


    <v-card-actions class="justify-space-around mt-n8">

      <v-tooltip top>
        <template v-slot:activator="{on, attrs}">
          <v-btn
              icon
              v-on="on"
              v-bind="attrs"
              @click="forcePull"
              :loading="pullLoading"
              :disabled="syncItem.errorFlag !== undefined"
          >
            <v-icon>mdi-cloud-download-outline</v-icon>
          </v-btn>
        </template>
        <span>Force pull server collection</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{on, attrs}">
          <v-btn
              icon
              v-on="on"
              v-bind="attrs"
              @click="forcePush"
              :loading="pushLoading"
              :disabled="syncItem.errorFlag !== undefined"
          >
            <v-icon>mdi-folder-upload-outline</v-icon>
          </v-btn>
        </template>
        <span>Force push local collection</span>
      </v-tooltip>

    </v-card-actions>


  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import ReadOnlyTextField from "@/ui/components/configuration/ReadOnlyTextField.vue";
import {SyncItem} from "@/model/storage/SyncItem";
import {upsertSyncItem} from "@/lib/storage/syncItem";
import {pullItem, pushItem} from "@/lib/strategies/basic";
import {deleteCollectionAPI} from "@/api/collection";

@Component({
  components: {ReadOnlyTextField}
})
export default class SyncSimpleInfoComponent extends Vue {

  syncStatus = true
  pullLoading = false
  pushLoading = false

  errorMap = new Map<string, string>([
      ["SERVER_ROOT_DELETED", "The sync server collection has been deleted!"],
      ["LOCAL_ROOT_DELETED", "The sync local collection has been deleted!"],
      ["USER_CANCELED", "You have disabled this sync!"]
  ])

  @Prop({type: Object})
  syncItem: SyncItem

  created() {
    this.syncStatus = this.syncItem.errorFlag === undefined
  }

  async changeSyncStatus(){
    this.syncItem.errorFlag = this.syncItem.errorFlag === undefined ? 'USER_CANCELED' : undefined
    await upsertSyncItem(this.syncItem)
  }

  async forcePull() {
    this.pullLoading = true
    await pullItem(this.syncItem.syncId)
    this.pullLoading = false
  }

  async forcePush() {
    this.pushLoading = true
    await deleteCollectionAPI(this.syncItem.serverCollectionId)
    await pushItem(this.syncItem.syncId)
    this.pushLoading = false
  }

}
</script>