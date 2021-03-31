<template>
  <v-card elevation="14" class="mx-auto my-12" width="700" max-height="700" rounded>
    <v-stepper v-model="stepFlag">


      <v-stepper-header>
        <v-stepper-step
            :complete="stepFlag > 1"
            step="1"
        >
          Choose Local Parent Collection
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
            :complete="stepFlag > 2"
            step="2"
        >
          Choose Remote Collection
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="3">
          Confirm
        </v-stepper-step>
      </v-stepper-header>


      <v-stepper-items>

        <v-stepper-content step="1">
          <selectable-tree
              :items="localTree"
              on-icon="mdi-folder-sync-outline"
              off-icon="mdi-folder-outline"
              :multiple-choice=false
              @getSelection="getLocalSelection"
          ></selectable-tree>
          <v-btn
              outlined
              color="primary"
              :disabled="localSelection.length === 0"
              :loading="loadFlag"
              @click="firstStep"
          >
            Continue
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <selectable-tree
              :items="serverTree"
              on-icon="mdi-folder-sync-outline"
              off-icon="mdi-folder-outline"
              :multiple-choice=false
              @getSelection="getServerSelection"
          ></selectable-tree>
          <v-btn
              outlined
              color="primary"
              :disabled="serverSelection.length === 0"
              @click="secondStep"
          >
            Continue
          </v-btn>
          <v-btn text @click="stepFlag = 1">
            Back
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-container
              style="height:500px"
              id="scroll-target"
              v-scroll.self="onScroll"
              class="overflow-y-auto"
          >
            <!--The result of sync folder-->
            <result-list
                header="Local Collection"
                item-icon="mdi-folder-upload-outline"
                :content="localSelection.length === 0 ? null : localSelection[0].name"
            >
            </result-list>
            <v-divider></v-divider>
            <result-list
                header="Remote Parent Collection"
                item-icon="mdi-folder-download-outline"
                :content="serverSelection.length === 0 ? null : serverSelection[0].name"
            >
            </result-list>
            <!--Show when the sub collection is syncing-->
            <v-divider v-show="errFlag"></v-divider>
            <sync-strategy
                v-show="errFlag"
                title="Syncing Collection Conflict"
                :list-items="errorListItems"
                :content="errorContent"
                content-style="error"
                @getSelection="getErrorStrategySelection"
            ></sync-strategy>
            <!--Show when server contain the same name collection-->
            <v-divider v-show="warnFlag"></v-divider>
            <sync-strategy
                v-show="warnFlag"
                title="Same Name Conflict"
                :list-items="warnListItems"
                :content="warnContent"
                content-style="warn"
                @getSelection="getWarnStrategySelection"
            ></sync-strategy>
          </v-container>
          <!--Show after confirm the sync, and wait for the finish of sync-->
          <v-dialog
              v-model="dialogFlag"
              persistent
              max-width="400"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  outlined
                  color="primary"
                  @click="dealStrategy"
                  :disabled="(warnFlag && warnStrategySelection === '') || (errFlag && errorStrategySelection === '')"
                  v-bind="attrs"
                  v-on="on"
              >
                Finish
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="headline">
                Syncing
              </v-card-title>
              <v-card-text v-show="finishFlag">
                <v-progress-circular
                    indeterminate
                    color="grey"
                    width="2"
                    size="20"
                ></v-progress-circular>
                <span style="line-height: 26px">Please wait a minute...</span>
              </v-card-text>
              <v-card-actions>
                <v-btn
                    v-show="!finishFlag"
                    color="green"
                    text
                    @click="closePage"
                >
                  Sync Finish! Close This Page.
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-btn text @click="stepFlag = 2">
            Back
          </v-btn>
        </v-stepper-content>

      </v-stepper-items>


    </v-stepper>
  </v-card>
</template>
<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {TreeView} from "@/model/view/TreeView";
import {getLocalCollectionTree, getParentId, getServerCollectionTree, setTreeNode} from "@/lib/util/treeViewUtil";
import SelectableTree from "@/ui/components/sync/SelectableTree.vue";
import ResultList from "@/ui/components/sync/ResultList.vue";
import {SyncItem} from "@/model/storage/SyncItem";
import {deleteSyncItem, listSyncItems, upsertSyncItem} from "@/lib/storage/syncItem";
import {browser} from "webextension-polyfill-ts";
import {getLocalCollectionIds} from "@/lib/util/scan/localCollection";
import {deleteCollectionAPI} from "@/api/collection";
import {listLocalSyncIds} from "@/lib/storage/systemInfo";
import SyncStrategy from "@/ui/components/sync/SyncStrategy.vue";
import {StrategyListItem} from "@/model/view/StrategyList";
import {containSameElem, filterSameElem} from "@/lib/util/arrayUtil";
import {pullItem, pushItem, removeLocalCollection} from "@/lib/strategies/basic";

@Component({components: {SyncStrategy, ResultList, SelectableTree}})
export default class PullComponent extends Vue {

  stepFlag = 1
  warnFlag = false
  errFlag = false
  dialogFlag = false
  finishFlag = false
  loadFlag = false
  offsetTop = 0

  serverTree = new Array<TreeView>()
  localTree = new Array<TreeView>()

  warnStrategySelection = ''
  errorStrategySelection = ''
  serverSelection = new Array<TreeView>()
  localSelection = new Array<TreeView>()
  syncItem: SyncItem = undefined

  warnConflictCollection: number = undefined
  errorConflictSyncItems = new Array<SyncItem>()

  warnListItems: Array<StrategyListItem> = [
    {value: "local", label: "According to local", tooltip: "This will delete same name collection on the server"},
    {value: "server", label: "According to server", tooltip: "This will delete all entries under the local collection"}
  ]
  warnContent = "Detected the collection has been existed in the target collection. Please select the sync statement."

  errorListItems: Array<StrategyListItem> = [
    {value: "localAndServer", label: "Delete the conflict sync item and related server data", tooltip: "This will delete server data"},
    {value: "localOnly", label: "Only delete the conflict sync item"},
    {value: "cancel", label: "Close this page and this sync item won't be used"}
  ]
  errorContent = "Detected some collections which under selected local collection are syncing.Please select the sync statement."

  async created() {
    await getLocalCollectionTree().then(res => this.localTree = res)
  }

  onScroll(e: Event) {
    const target = (<HTMLInputElement>e.target)
    this.offsetTop = target.scrollTop
  }

  getServerSelection(selections: Array<TreeView>) {
    this.serverSelection = selections
  }

  getLocalSelection(selections: Array<TreeView>) {
    this.localSelection = selections
  }

  getWarnStrategySelection(selection: string) {
    console.log(selection)
    this.warnStrategySelection = selection
  }

  getErrorStrategySelection(selection: string) {
    console.log(selection)
    this.errorStrategySelection = selection
  }

  async firstStep() {
    this.loadFlag = true
    this.serverTree = []
    this.serverTree = await getServerCollectionTree()
    this.errFlag = await this.detectSyncingCollection()
    this.stepFlag = 2
    this.loadFlag = false
  }

  async secondStep() {
    this.stepFlag = 3
    this.warnFlag = this.detectCollectionExist()
  }

  async initSyncItem() {
    const serverCollectionId = this.serverSelection[0].id
    const localParentCollectionId = this.localSelection[0].id
    const serverParentCollectionId = getParentId(this.serverTree, serverCollectionId)
    this.syncItem = new SyncItem(this.warnConflictCollection, localParentCollectionId, serverCollectionId, serverParentCollectionId)
  }

  closePage() {
    browser.tabs.getCurrent().then(tab => browser.tabs.remove(tab.id))
  }

  async detectSyncingCollection() {
    let selectedCollections = await getLocalCollectionIds(this.localSelection[0].id)
    let syncingCollections = await listLocalSyncIds()
    let conflictCollections = filterSameElem(selectedCollections, syncingCollections)

    // If there is no conflict, directly return false. Else filter the conflict syncItem.
    if (conflictCollections.length === 0) {
      return false
    }
    this.errorConflictSyncItems = (await listSyncItems())
        .filter(async syncItem => {
          containSameElem(await getLocalCollectionIds(syncItem.localCollectionId), conflictCollections)
        })

    // If exist conflict syncItem, set related server collection node to disable and no children.
    for (const errorConflictSyncItem of this.errorConflictSyncItems) {
      let newNode = new TreeView(errorConflictSyncItem.serverCollectionId)
      newNode.disable = true
      newNode.children = []
      await setTreeNode(this.serverTree[0], newNode)
    }

    return true
  }

  detectCollectionExist() {
    if (this.serverSelection.length !== 0 && this.localSelection.length !== 0) {
      let localChild = this.localSelection[0].children
      let localChildNames = localChild.map(child => child.name)
      let conflictIndex = localChildNames.indexOf(this.localSelection[0].name)
      if (conflictIndex != -1) {
        this.warnConflictCollection = localChild[conflictIndex].id
        return true
      }
    }
    return false
  }

  async deleteSyncInfos(syncItem: SyncItem) {
    await removeLocalCollection(syncItem.localCollectionId)
    await deleteSyncItem(syncItem.syncId)
  }

  /*------------------------------------------------< Strategies >--------------------------------------------*/

  async dealStrategy() {
    if (this.errFlag) {
      switch (this.errorStrategySelection) {
        case "cancel":
          await this.closePage();
          return;
        case "localOnly":
          await this.errorLocalOnly();
          break;
        case "localAndServer":
          await this.errorLocalAndServer();
      }
    }
    await this.initSyncItem()
    this.syncItem = await upsertSyncItem(this.syncItem)
    if (this.warnFlag) {
      switch (this.warnStrategySelection) {
        case "local":
          await this.warnLocal();
          break;
        case "server":
          await this.warnServer();
          break;
      }
    } else {
      await pullItem(this.syncItem.syncId)
    }
  }

  async errorLocalOnly() {
    for (const syncItem of this.errorConflictSyncItems) {
      await this.deleteSyncInfos(syncItem)
    }
  }

  async errorLocalAndServer() {
    for (const syncItem of this.errorConflictSyncItems) {
      await this.deleteSyncInfos(syncItem)
      await deleteCollectionAPI(syncItem.serverCollectionId)
    }
  }

  async warnLocal() {
    await deleteCollectionAPI(this.warnConflictCollection)
    await pushItem(this.syncItem.syncId)
  }

  async warnServer() {
    await pullItem(this.syncItem.syncId)
  }

}
</script>