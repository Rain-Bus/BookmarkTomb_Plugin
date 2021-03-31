<template>
  <ValidationProvider :rules="rules" v-slot="{errors}" style="width: 100%">
    <v-text-field
        :label="$attrs.label"
        :value="content"
        :error-messages="errors"
        :type="type"
        :append-icon="icon"
        required
        outlined
        :suffix="suffix"
        :hint="hint"
        @change="sendContent"
        @click:append="sendClickAppend"
    ></v-text-field>
  </ValidationProvider>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {ValidationProvider} from "vee-validate"

@Component({components: {ValidationProvider}})
export default class ValidateTextFieldComponent extends Vue {

  @Prop({type: String, default: ""})
  content: string
  @Prop({type: String, default: ""})
  rules: string
  @Prop({type: String, default: ""})
  icon!: string
  @Prop({type: String, default: "text"})
  type!: string
  @Prop({type: String})
  suffix: string
  @Prop({type: String})
  hint: string

  sendContent(newValue: string) {
    this.$emit("update:content", newValue)
  }

  sendClickAppend() {
    this.$emit("click:append")
  }

}
</script>