<template>
  <v-container>


    <v-row>
      <v-col
          cols="8"
          offset="2">
        <v-text-field
            label="Sync Name"
            v-model="item.syncName"
            outlined
            dense
            @blur="changeSyncName"
        ></v-text-field>
      </v-col>
    </v-row>


    <v-row class="mt-n6">
      <v-col
          cols="8"
          offset="2">
        <read-only-text-field
            label="Last Updated Time"
            :hint="errorMap.get(item.errorFlag)"
            :value="item.serverModifyTime.toLocaleString()"
            :append-icon-color="item.errorFlag === undefined ? 'green' : 'red'"
            :append-inner-icon="item.errorFlag === undefined ? 'mdi-sync' : 'mdi-sync-alert'"
        ></read-only-text-field>
      </v-col>
    </v-row>


    <v-row class="mt-n6">
      <v-col
          cols="8"
          offset="2">
        <read-only-text-field
            label="Local Collection Path"
            :value="localPath"
            prepend-inner-icon="mdi-folder-outline"
        ></read-only-text-field>
      </v-col>
    </v-row>


    <v-row class="mt-n6">
      <v-col
          cols="8"
          offset="2">
        <read-only-text-field
            label="Server Collection Path"
            :value="serverPath"
            prepend-inner-icon="mdi-folder-outline"
        ></read-only-text-field>
      </v-col>
    </v-row>


    <v-row>

      <!--This is the history btn and page-->
      <v-col
          cols="2"
          offset="3"
      >
        <v-dialog
            v-model="showHistoryDialog"
            max-width="600"
            scrollable
        >
          <template v-slot:activator="{on, attrs}">
            <v-btn
                outlined
                color="blue"
                v-on="on"
                v-bind="attrs"
            >History</v-btn>
          </template>
          <v-card
              width="600"
              height="600"
          >
            <v-card-title>Histories</v-card-title>
            <v-card-subtitle>
              <v-select
                  dense
                  outlined
                  class="mt-3"
                  label="Choose a Time"
                  :items="oldTreeTimes"
                  @change="changeHistorySelection"
                  no-data-text="No old tree exist!"
              ></v-select>
            </v-card-subtitle>
            <v-card-text class="mt-n7">
              <v-treeview
                  :items="oldTreeView"
                  dense
              >
                <template v-slot:prepend="{item}">
                  <v-icon>{{item.url === undefined ? "mdi-folder-outline" : "mdi-bookmark-outline"}}</v-icon>
                </template>
                <template v-slot:append="{item}">
                  <v-btn
                      icon
                      :href="item.url"
                      target="_blank"
                      v-if="item.url !== undefined"
                  >
                    <v-icon>mdi-link</v-icon>
                  </v-btn>
                </template>
              </v-treeview>
            </v-card-text>
            <v-card-actions class="justify-space-around">
              <v-tooltip top>
                <template v-slot:activator="{on, attrs}">
                  <v-btn
                      v-on="on"
                      v-bind="attrs"
                      color="red"
                      outlined
                      :disabled="oldTree === undefined"
                      @click="restore"
                  >Restore</v-btn>
                </template>
                <span>This will delete local and server collection!</span>
              </v-tooltip>
              <v-btn
                  color="blue"
                  outlined
                  @click="showHistoryDialog = !showHistoryDialog"
              >Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>

      <!--This is the delete btn and page.-->
      <v-col
          cols="2"
          offset="2"
      >
        <v-dialog
            v-model="showDeleteDialog"
            scrollable
            persistent
            max-width="450"
        >
          <template v-slot:activator="{on, attrs}">
            <v-btn
                outlined
                color="red"
                v-on="on"
                v-bind="attrs"
            >Delete</v-btn>
          </template>
          <v-card>
            <v-card-title>Choose Delete Dates</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-checkbox
                  dense
                  persistent-hint
                  v-model="deleteStrategy"
                  v-for="checkBoxInfo in checkBoxInfos"
                  :key="checkBoxInfo.value"
                  :hint="checkBoxInfo.hint"
                  :label="checkBoxInfo.label"
                  :value="checkBoxInfo.value"
                  :disabled="checkBoxInfo.disabled"
              ></v-checkbox>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="justify-space-around">
              <v-btn
                  color="red"
                  outlined
                  :loading="confirmDeleteLoading"
                  @click="confirmDelete"
              >Confirm</v-btn>
              <v-btn
                  color="blue"
                  outlined
                  @click="showDeleteDialog = !showDeleteDialog"
              >Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>


  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {SyncItem} from "@/model/storage/SyncItem";
import {upsertSyncItem} from "@/lib/storage/syncItem";
import ReadOnlyTextField from "@/ui/components/configuration/ReadOnlyTextField.vue";
import {generateTreeViewByTree, getLocalPath, getServerPath} from "@/lib/util/treeViewUtil";
import {listTimeById, selectOldTree} from "@/lib/storage/oldTrees";
import dayjs from "dayjs";
import {TreeView} from "@/model/view/TreeView";
import {
  insertByOldTree,
  pushBookmark,
  pushCollection,
  removeLocalCollection,
  removeSyncItem
} from "@/lib/strategies/basic";
import {containElem} from "@/lib/util/arrayUtil";
import {deleteCollectionAPI} from "@/api/collection";
import {Bookmarks, browser} from "webextension-polyfill-ts";
import BookmarkTreeNode = Bookmarks.BookmarkTreeNode;

@Component({
  components: {ReadOnlyTextField}
})
export default class SyncItemPanelComponent extends Vue {

  localPath = " "
  serverPath = " "
  showDeleteDialog = false
  showHistoryDialog = false
  deleteStrategy = new Array<string>("sync")
  checkBoxInfos = [
    {label: "Sync Item", value: "sync", hint: "Will delete the sync item, and delete the histories.", disabled: true},
    {label: "Local Collections", value: "local", hint: "Will delete the sync collection from browser, can't restore.", disabled: false},
    {label: "Server Collections", value: "server", hint: "Will delete the sync collection from server.", disabled: false}
  ]
  oldTree: BookmarkTreeNode = undefined
  oldTreeTimes = new Array<string>()
  oldTreeView = new Array<TreeView>()
  confirmDeleteLoading = false
  errorMap = new Map<string, string>([
    ["SERVER_ROOT_DELETED", "The sync server collection has been deleted!"],
    ["LOCAL_ROOT_DELETED", "The sync local collection has been deleted!"],
    ["USER_CANCELED", "You have disabled this sync!"]
  ])

  @Prop({type: Object})
  item: SyncItem

  async created(){
    let localItem = await getLocalPath(this.item.localCollectionId)
    let serverItem = await getServerPath(this.item.serverCollectionId)
    while (localItem !== undefined) {
      this.localPath = this.localPath + "/" + localItem[0].name
      localItem = localItem[0].children
    }
    while (serverItem !== undefined) {
      this.serverPath = this.serverPath + "/" + serverItem[0].name
      serverItem = serverItem[0].children
    }
    this.oldTreeTimes = (await listTimeById(this.item.syncId)).map(date => dayjs(date).format("YYYY-MM-DD HH:mm:ss.SSS"))
  }

  async changeSyncName() {
    this.$emit("update:syncName", this.item.syncId, this.item.syncName)
    await upsertSyncItem(this.item)
  }

  async changeHistorySelection(selection: string) {
    this.oldTree = await selectOldTree(this.item.syncId + "<>" + dayjs(selection).toISOString())
    this.oldTreeView = await generateTreeViewByTree(this.oldTree)
    console.log(this.oldTreeView)
  }

  async confirmDelete() {
    this.confirmDeleteLoading = true
    await removeSyncItem(this.item.syncId, containElem(this.deleteStrategy, "local"), containElem(this.deleteStrategy, "server"))
    this.confirmDeleteLoading = false
    this.showDeleteDialog = false
    this.$emit("deleteItem", this.item)
  }

  async restore() {
    await removeLocalCollection(this.item.localCollectionId)
    await deleteCollectionAPI(this.item.serverCollectionId)
    await browser.bookmarks.removeTree(this.item.localCollectionId.toString())
    this.item.localCollectionId = await insertByOldTree(this.oldTree)
    this.item.serverCollectionId = await pushCollection(this.item.localCollectionId, this.item.serverParentCollectionId)
    await upsertSyncItem(this.item)
    await pushBookmark(this.item.localCollectionId)
  }
}
</script>