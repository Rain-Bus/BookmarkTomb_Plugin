<template>
  <v-list>


    <v-subheader>
      {{title}}
    </v-subheader>


    <v-list-item>
      <span :class="styleMap.get(contentStyle)">
        {{content}}
      </span>
    </v-list-item>


    <v-list-item>
      <v-radio-group
          v-model="selected"
          @change="sendSelection"
      >

        <v-tooltip top v-for="item in listItems" :disabled="item.tooltip===undefined">
          <template v-slot:activator="{ on, attrs }">
            <v-radio
                :label=item.label
                :value=item.value
                :disabled="item.value === undefined"
                v-bind="attrs"
                v-on="on"
            ></v-radio>
          </template>
          <span>{{item.tooltip}}</span>
        </v-tooltip>

      </v-radio-group>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {StrategyListItem} from "@/model/view/StrategyList";

@Component
export default class SyncStrategyComponent extends Vue {
  selected: string = ''

  // The null value of the StrategyListItem is useful.
  //    Value is null: Disable the radio
  //    Tooltip is null: Disable tooltip
  //    Label can't be null
  @Prop({type: Array, default: () => new Array<StrategyListItem>()})
  listItems!: Array<StrategyListItem>
  @Prop({type: String, default: "Content"})
  content!: string
  @Prop({type: String, default: "Please Choose"})
  title!: string
  @Prop({type: String, default: "normal"})
  contentStyle!: string

  styleMap: Map<string, string> = new Map<string, string>()
      .set("warn", "orange--text")
      .set("error", "red--text")
      .set("success", "green--text")
      .set("normal", "grey--text")

  sendSelection() {
    this.$emit('getSelection', this.selected)
  }
}
</script>