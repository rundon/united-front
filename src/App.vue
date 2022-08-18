<template>
  <transition name="el-fade-in-linear">
    <router-view />
  </transition>
</template>

<style>
.el-table th.gutter {
  display: table-cell !important;
}
</style>
<script>
import Cookies from "js-cookie";
import { messages } from "@/i18n";
export default {
  watch: {
    "$i18n.locale": "i18nHandle",
  },
  created() {
    let token = localStorage.getItem(`${window.location.hostname}_token`);
    let refresh = localStorage.getItem(`${window.location.hostname}_refresh`);
    if (token) {
      this.$store.commit("UPDATE_TOKEN", token);
    }
    if (refresh) {
      this.$store.commit("UPDATE_REFRESH", refresh);
    }
    this.i18nHandle(this.$i18n.locale);
  },
  methods: {
    i18nHandle(val, oldVal) {
      Cookies.set("language", val);
      document.querySelector("html").setAttribute("lang", val);
      document.title = messages[val].brand.lg;
      // 非登录页面，切换语言刷新页面
      if (this.$route.name !== "login" && oldVal) {
        window.location.reload();
      }
    },
  },
};
</script>
