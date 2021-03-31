<template>
  <v-list>


    <v-subheader>
      {{header}}
    </v-subheader>


    <v-list-item>

      <v-list-item-icon>
        <v-icon>{{itemIcon}}</v-icon>
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title>
          {{content}}
        </v-list-item-title>
      </v-list-item-content>

    </v-list-item>


  </v-list>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class ResultListComponent extends Vue {
  @Prop({type: String, default: 'Header'})
  header: string
  @Prop({type: String, default: 'mdi-menu'})
  itemIcon: string
  @Prop({type: String, default: 'Content'})
  content: string
}
</script>