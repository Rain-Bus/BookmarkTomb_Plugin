import Vue from "vue";
import Router from "vue-router";
import Push from "@/ui/views/sync/Push.vue";
import Pull from "@/ui/views/sync/Pull.vue";
import Popup from "@/ui/views/popup/Popup.vue";
import Login from "@/ui/views/connect/Login.vue";
import Config from "@/model/constant/settings";
import Connect from "@/ui/views/connect/Connect.vue";
import Setting from "@/ui/views/configuration/SetTabs.vue"

Vue.use(Router);

export const router = new Router({
  routes: [
    {
      path: "/",
      name: "Popup",
      component: Popup,
    },
    {
      path: "/connect",
      name: "Connect",
      component: Connect,
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/push",
      name: "Push",
      component: Push,
    },
    {
      path: "/pull",
      name: "Pull",
      component: Pull
    },
    {
      path: "/setting",
      name: "Setting",
      component: Setting
    }
  ],
});

router.beforeEach((to, from, next) => {
  if (to.name !== "Popup"){
    if (to.name !== "Connect" && localStorage.getItem("baseURL") == null)
      next({name: "Connect"});
    else if (to.name !== "Login" && to.name !== "Connect" && localStorage.getItem(Config.tokenName) == null)
      next({name: "Login"});
    else next();
  } else next()
});
