<template>
  <div>
    <v-card elevation="14" class="mx-auto my-12" width="400" height="400">


      <v-card-title>
        Login
      </v-card-title>


      <v-card-text>
        <validation-observer ref="observer" v-slot="{invalid}">
          <v-form>
            <v-col>

              <v-row>
                <validated-text-field
                    label="Account"
                    :content.sync="loginInfo.loginAccount"
                    rules="required|beginWithChar|accountChar|min:6|max:20"
                ></validated-text-field>
              </v-row>

              <v-row>
                <validated-text-field
                    label="Password"
                    rules="required|passwordChar|min:8|max:20"
                    :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="showPassword ? 'text' : 'password'"
                    :content.sync="loginInfo.loginPassword"
                    @click:append="showPassword = !showPassword"
                ></validated-text-field>
              </v-row>

              <v-row>
                <validated-text-field
                    label="Verify Code"
                    :content.sync="loginInfo.code"
                    rules="required|numeric"
                    style="width: auto"
                ></validated-text-field>
                <v-btn
                    width="100"
                    @click="getCodeImg"
                    :loading="codeImgButton.loading"
                    class="mx-auto mt-3"
                    text
                >
                  <v-img max-width="100" contain :src="codeImg"/>
                </v-btn>
              </v-row>

              <v-row>
                <v-btn
                    @click="userLogin"
                    color="blue"
                    :disabled="invalid"
                    class="mx-auto"
                    :loading="loginButton.loading"
                >Login</v-btn>
              </v-row>

            </v-col>
          </v-form>
        </validation-observer>
      </v-card-text>


    </v-card>


    <v-snackbar
        v-model="snackbar.show"
        :timeout="snackbar.timeout"
        color="orange"
    >
      {{ snackbar.text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>


  </div>
</template>

<script lang="ts">
import ErrorMessage from "@/model/constant/error";
import {Component, Vue} from "vue-property-decorator";
import ValidatedTextField from "@/ui/components/connect/ValidatedTextField.vue";
import {ValidationObserver} from "vee-validate";
import {browser} from "webextension-polyfill-ts";
import {getCodeImgAPI, loginAPI} from "@/api/user";

@Component({components: {ValidatedTextField, ValidationObserver}})
export default class LoginComponent extends Vue {
  showPassword = false;
  codeImg = "";
  valid = true;
  loginInfo = {
    code: "",
    codeUid: "",
    loginAccount: "",
    loginPassword: "",
    rememberMe: true,
  };
  snackbar = {
    show: false,
    text: "",
    timeout: 2000,
  };
  loginButton = {
    loading: false,
  };
  codeImgButton = {
    loading: false,
  };

  async created() {
    await this.getCodeImg();
  }

  async getCodeImg() {
    this.codeImgButton.loading = true;
    await getCodeImgAPI().then((resp: any) => {
          let data = resp.data
          this.loginInfo.codeUid = data.codeUid;
          this.codeImg = data.codeImg;
          this.codeImgButton.loading = false;
        }).catch(() => {
          this.snackbar.show = true;
          this.snackbar.text = ErrorMessage.get(6001);
          this.codeImgButton.loading = false;
        });
  }

  async userLogin() {

    this.loginButton.loading = true;
    await loginAPI(this.loginInfo).then((res: any) => {
          console.log(res);
          this.loginButton.loading = false;
        }).catch(async (err) => {
          await this.getCodeImg();
          if (err.response != undefined) {
            this.snackbar.text = ErrorMessage.get(err.response.data.code);
            this.snackbar.show = true;
          }
          this.loginButton.loading = false;
        });
    await browser.tabs.remove((await browser.tabs.getCurrent()).id)
  }
}
</script>

<style></style>
