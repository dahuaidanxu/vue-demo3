<style scoped lang="scss">
.main {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
<template>
  <div class="main">
    <div id="mapContainer" class="map"></div>
  </div>
</template>

<script>
import AMapLoader from "@amap/amap-jsapi-loader";
export default {
  name: "AppMap",
  data() {
    return {
      map: null,
    };
  },
  mutations: {

  },
  mounted: function () {
    //初始化底图
    AMapLoader.load({
      key: "aae6a7105688bf15a2ba841d2e98ee23", // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: [
        "AMap.Scale",
        "AMap.IndexCluster",
        "AMap.MarkerCluster",
        "AMap.ToolBar",
        "AMap.Driving",
        "AMap.TruckDriving",
        "AMap.MoveAnimation",
        "AMap.Geocoder",
        "AMap.PlaceSearch",
        "AMap.Weather",
        "AMap.MapType",
        "AMap.Walking",
        "AMap.GeoJSON",
      ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
      .then((AMap) => {
        //设置底图属性
        this.map = new AMap.Map("mapContainer", {
          resizeEnable: true, //是否监控地图容器尺寸变化
          zoom: 9.6, //初始地图级别
          center: [118.80156, 31.962938], //初始地图中心点
          viewMode: "3D", // 地图模式
          mapStyle:
            localStorage.getItem("APP-SKIN-TYPE") == "light"
              ? "amap://styles/normal"
              : "amap://styles/blue",
        });

        //南京市区域图边框效果初始化
        let disProvince = new AMap.DistrictLayer.Province({
          zIndex: 10,
          adcode: [320100],
          depth: 2,
          styles: {
            fill: ["rgb(0,0,0,0)"],
            "stroke-width": 3,
            "city-stroke": "#FFB05F", //中国地级市边界
            "county-stroke": "#0000", //中国区县边界
          },
        });

        disProvince.setMap(this.map);//区域图加入到地图中
      })
      .catch((e) => {
        console.log(e);
      });
  },
  watch: {
    //监听换肤效果，切换底图效果
    "$store.state.appThemeType"() {
      // console.log(this.$store.state.appThemeType);
      this.map.setMapStyle(
        this.$store.state.appThemeType == "light"
          ? "amap://styles/normal"
          : "amap://styles/blue"
      );
    },

    //监听刷新的警情列表
    "$store.state.appRecentIncidentList"() {
      //警情列表上图
    },
  },
  destroyed() {
    this.map.destroy();//销毁地图

  }
};
</script>
