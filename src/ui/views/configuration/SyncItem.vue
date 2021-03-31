<template>
  <v-container>

    <v-expansion-panels>
      <v-expansion-panel
          v-for="item of syncItems"
          :key="item.syncId">

        <v-expansion-panel-header disable-icon-rotate>
          <template v-slot:actions>
            <v-icon :color="item.errorFlag === undefined ? 'green' : 'red'">
              {{item.errorFlag === undefined ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'}}
            </v-icon>
          </template>
          {{item.syncName}}
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <sync-item-panel
              :item="item"
              @update:syncName="getSyncNameUpdate"
              @deleteItem="deleteItem"
          ></sync-item-panel>
        </v-expansion-panel-content>

      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {listSyncItems} from "@/lib/storage/syncItem";
import {SyncItem} from "@/model/storage/SyncItem";
import SyncItemPanel from "@/ui/components/configuration/SyncItemPanel.vue";

@Component({
  components: {SyncItemPanel}
})
export default class SyncItemComponent extends Vue {
  syncItems = new Array<SyncItem>()
  async created() {
    this.syncItems = await listSyncItems()
    console.log(this.syncItems)
  }

  async getSyncNameUpdate(syncId: string, syncName: string) {
    this.syncItems.forEach(item => item.syncId === syncId ? item.syncName = syncName : null)
  }

  deleteItem(syncItem: SyncItem) {
    this.syncItems.splice(this.syncItems.indexOf(syncItem), 1)
  }
}
</script>