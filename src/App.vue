<!-- @import './assets/style/theme.scss'; -->
<style scoped lang="scss">
@import "./assets/style/theme.scss";

#app {
  width: 100%;
  height: 100%;
}

.layout-logo {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 35px;
  font-weight: bolder;

  .logo {
    width: 40px;
    height: 42px;
    margin-right: 10px;
  }
}

.switch-body {
  padding: 0 10px;
  height: 100%;
  float: right;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-top {
  @include app-top-nav();
}
</style>

<template>
  <div id="app" theme-style="">
    <Menu mode="horizontal" theme="dark" active-name="1" class="nav-top">
      <div class="layout-logo">
        <img class="logo" src="./assets/img/title_icon.png" alt="" srcset="" />
        苏州市消防救援支队指挥中心警情统计地图台
      </div>
      <div class="switch-body">
        <i-switch v-model="switch2" @on-change="changeSkin" size="large">
          <span slot="open">明亮</span>
          <span slot="close">暗色</span>
        </i-switch>
        &nbsp;&nbsp;
        <i-switch v-model="switch1" @on-change="changeRoute" size="large">
          <span slot="open">统计</span>
          <span slot="close">主页</span>
        </i-switch>
      </div>
    </Menu>

    <router-view />
  </div>
</template>
<script>
export default {
  data() {
    return {
      switch1: window.location.href.indexOf("about") == -1 ? false : true,
      switch2: localStorage.getItem("APP-SKIN-TYPE") == "light" ? true : false,
    };
  },
  methods: {
    changeRoute(status) {
      // this.$Message.info('开关状态：' + status);
      if (status) {
        this.$router.push("/about");
      } else {
        this.$router.push("/");
      }
    },
    changeSkin(val) {
      let dom = document.getElementById("app");
      if (val) {
        localStorage.setItem("APP-SKIN-TYPE", "light");
        this.$store.commit("changeThemeType", "light");
        dom?.setAttribute("theme-style", "light");
      } else {
        localStorage.setItem("APP-SKIN-TYPE", "dark");
        this.$store.commit("changeThemeType", "dark");
        dom?.setAttribute("theme-style", "dark");
      }
    },
  },
  mounted: function () {
    if (localStorage.getItem("APP-SKIN-TYPE")) {
      if (localStorage.getItem("APP-SKIN-TYPE") == "light") {
        setBodyStyleTheme(true);
      } else {
        setBodyStyleTheme(false);
      }
    } else {
      localStorage.setItem("APP-SKIN-TYPE", "dark");
      this.$store.commit("changeThemeType", "dark");
      setBodyStyleTheme(false);
    }
    function setBodyStyleTheme(bool) {
      let dom = document.getElementById("app");
      dom?.setAttribute("theme-style", bool ? "light" : "dark");
    }

    this.$store.dispatch("setIntervalRencentIncident", 1000 * 60 * 5);

    let type = "pub_jg_jgjbxx";
    this.axios
      .get(
        `/testAPI/geoServerURL-new/geoserver/egis/wfs?service=WFS&version=1.0.0&request=GetFeature&typename=egis:${type}&outputFormat=application/json`
      )
      .then(
        (res) => {
          this.$store.commit("changeUnitList", res.data.features);
        },
        (error) => {
          this.$Message.error("队站列表请求失败" + error);
        }
      );
  },
  components: {},
};
</script>
