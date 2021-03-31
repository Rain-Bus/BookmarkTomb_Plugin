<template>
  <v-container>

    <v-row v-show="label!==undefined">
      <v-col
          cols="8"
          offset="2"
      >
        <v-subheader v-text="label.replace('%d', value.toString())"></v-subheader>
      </v-col>
    </v-row>

    <v-row>
      <v-col
          :class="label !== undefined ? 'mt-n4' : null"
          cols="8"
          offset="2"
      >
        <v-slider
            :value="value"
            :min="min"
            :max="max"
            thumb-label
            @end="sendValue"
        ></v-slider>
      </v-col>
    </v-row>

  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class ValueSettingComponent extends Vue {

  @Prop({type: String})
  label?: string
  @Prop({type: Number, default: 0})
  min: number
  @Prop({type: Number, default: 100})
  max: number
  @Prop({type: Number, default: 0})
  value: number

  sendValue(value: number) {
    this.$emit("update:value", value)
  }

}

</script>