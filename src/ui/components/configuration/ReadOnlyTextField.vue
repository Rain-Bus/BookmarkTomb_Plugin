<template>
  <v-text-field
      :label="label"
      :value="value"
      :prepend-inner-icon="prependInnerIcon"
      :hint="hint"
      :persistent-hint="hint !== undefined"
      outlined
      disabled
      dense
  >
    <template v-slot:append>
      <v-icon :color="appendIconColor" v-text="appendInnerIcon"></v-icon>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class ReadOnlyTextFieldComponent extends Vue {

  @Prop({type: String, default: " "})
  value!: string
  @Prop({type: String, default: "Label"})
  label!: string
  @Prop({type: String, default: ""})
  prependInnerIcon: string
  @Prop({type: String, default: ""})
  appendInnerIcon: string
  @Prop({type: String, default: "grey"})
  appendIconColor: string
  @Prop({type: String})
  hint: string
}
</script>