<template>
  <v-container
      v-scroll.self="onScroll"
      id="scroll-target"
      style="height: 500px"
      class="overflow-y-auto"
  >

    <v-treeview
        dense
        item-key="id"
        selectable
        v-model="selection"
        item-disabled="disable"
        selected-color="blue"
        return-object
        :on-icon="onIcon"
        :off-icon="offIcon"
        selection-type="independent"
        :items="items"
        @input="choiceFun"
    ></v-treeview>

  </v-container>
</template>
<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {TreeView} from "@/model/view/TreeView";

@Component
export default class SelectableTreeComponent extends Vue {

  offsetTop = 0

  selection = new Array<TreeView>()

  @Prop({type: Array, required: true, default: () => new Array<TreeView>()})
  items!: Array<TreeView>
  @Prop({type: String, default: 'mdi-checkbox-marked-circle'})
  onIcon!: string
  @Prop({type: String, default: 'mdi-checkbox-blank-circle-outline'})
  offIcon!: string
  @Prop({type: Boolean, default: true})
  multipleChoice!: boolean

  choiceFun() {
    if (!this.multipleChoice) {
      this.selection.splice(0, this.selection.length - 1)
    }
    this.sendSelection()
  }

  onScroll(e: Event) {
    const target = (<HTMLInputElement>e.target)
    this.offsetTop = target.scrollTop
  }

  sendSelection() {
    this.$emit('getSelection', this.selection)
  }

}
</script>