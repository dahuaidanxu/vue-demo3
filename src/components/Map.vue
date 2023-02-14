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
      //覆盖物群组
      overlayGroupList: {
        ol_incident24: null, //24小时警情  --key
      },
      AMap: null,
    };
  },
  methods: {
    //警情列表上图
    incidentMarker(incList) {
      //上图之前先清除之前已经上图的
      this.removeOl_GaoDe("ol_incident24");
      //警情列表数据点位转换成marker格式
      let markerList = this.getFormatterMarkerList("ol_incident24", incList);
      //将marker放到overlayers中&&上图显示
      this.addResourceToOl_GaoDe(
        "ol_incident24",
        this.getMarkerFormatter_GaoDe("ol_incident24", markerList)
      );
    },
    //点击上图警情事件
    showIncidentDetail(incident) {
      console.log(incident);
    },

    //点位上图需要按照高德的形状修改
    getFormatterMarkerList(type, arrList) {
      let markerList = [];
      switch (type) {
        case "ol_incident24":
          arrList.forEach((r) => {
            // 创建一个 Icon
            let startIcon = new this.AMap.Icon({
              // 图标尺寸
              // size: new  this.AMap.Size(30, 35),
              // 图标的取图地址
              image: r.icon ? r.icon : require("../assets/img/huozai.svg"),
              // 图标所用图片大小
              imageSize: new this.AMap.Size(35, 40),
              // 图标取图偏移量
              // imageOffset: new  this.AMap.Pixel(-9, -3)
            });
            const marker = {
              lng: r.lng_GaoDe,
              lat: r.lat_GaoDe,
              title: r.DZ,
              icon: startIcon,
              icon_: r.icon ? r.icon : require("../assets/img/huozai.svg"),
              zIndex: r.ZT * 1 < 120 ? 11 : 10,
              incidentID: r.ID,
              AJBH: r.AJBH,
              AJLX: r.AJLX ? r.AJLX : "其它类型",
              ZDDWID: r.ZDDWID || 0,
            };
            markerList.push(marker);
          });
          break;

        default:
          break;
      }

      return markerList;
    },
    /**添加资源到群组中**/
    addResourceToOl_GaoDe(key, ols) {
      this.overlayGroupList[key] = new this.AMap.OverlayGroup(ols); //OverlayGroup一定要在初始化的时候填入初始值，不然操作方法会无效
      this.map.add(this.overlayGroupList[key]);
    },
    /**显影某个覆盖物图层**/
    switchOl_GaoDe(key, bool) {
      if (this.map == null) {
        return;
      }
      bool
        ? this.overlayGroupList[key].show()
        : this.overlayGroupList[key].hide();
    },
    /**移除覆盖物**/
    removeOl_GaoDe(key) {
      if (this.overlayGroupList[key] == null) {
        return;
      }
      this.map.remove(this.overlayGroupList[key]);
    },
    /**格式化点位**/
    getMarkerFormatter_GaoDe(type, list) {
      let that = this;
      let markerList = [];

      list.forEach((item) => {
        let marker = new this.AMap.Marker({
          position: new this.AMap.LngLat(item.lng, item.lat), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          id: item.id || "",
          title: item.title || "测试",
          icon: item.icon || "../assets/shangtu/shifadi.svg",
          anchor: "center", //设置锚点 anchor 可选值有  'top-left'、'top-center'、'top-right'、'middle-left'、'center'、'middle-right'、'bottom-left'、'bottom-center'、'bottom-right'
          offset: item.offset || new this.AMap.Pixel(0, 0), //设置偏移量 通过设置 offset 来添加偏移量。当偏移量为 (0, 0) 时，自定义内容默认以左上角为基准点（若设置了 anchor，基准点位置则为 anchor 设置的位置）与经纬度坐标对齐；设置 offset 为其他值则对齐位置相应改变
          zIndex: item.zIndex ? item.zIndex : 1,
        });
        markerList.push(marker);

        marker.on("click", function () {
          if (type == "ol_incident24") {
            that.showIncidentDetail(item);
          } else {
            if (that.getInfoWindow_GaoDe(type, item)) {
              that.InfoWindow = that.getInfoWindow_GaoDe(type, item);
              that.openInfoWindow_GaoDe(that.InfoWindow, item.lng, item.lat);
            }
          }
        });
      });

      return markerList;
    },
    /**
     * 自定义窗体 资源点击详情窗口设置
     */
    getInfoWindow_GaoDe(type, obj) {
      let content = [];
      switch (type) {
        case "pub_jg_jgjbxx": //消防机构
          // 折线的节点坐标数组，每个元素为 AMap.LngLat 对象
          // lng: r.properties.gis_x,  //经纬度;lat: r.properties.gis_y,//经纬度;icon: icon,//图标;title: r.properties.jgmc,//机构名称;desc: r.properties.jgms,//机构描述;address: r.properties.jgdz,//地址;contacts: r.properties.lxr,//责任人;contacts_phone: r.properties.lxdh,//责任人电话;refreshTime: r.properties.sjc.substring(0, 10) //更新时间
          content = [
            "<div style='max-width:300px'><img src='" +
              obj.icon +
              "'><span style='padding-left:5px;font-size: 14px;font-weight:600;display:inline-block;height:24px;line-height:24px;'>消防机构</span> ",
            "<div style='padding:0px 4px'><b style='font-size:18px;padding-bottom:10px;display: inline-block;'>" +
              obj.title +
              "</b>",
            "<span style='padding-bottom:5px;display: inline-block;'>联系人电话 : " +
              obj.contacts_phone +
              "</span></div></div>",
            // "<span style='padding-bottom:5px;display: inline-block;'>更新时间:&nbsp;" + obj.refreshTime + "</span></div></div>"
          ];
          break;
        case "pub_sy_shsxx": //消防栓  地址、类型、状态、取水方式、时间
          // 折线的节点坐标数组，每个元素为 AMap.LngLat 对象
          content = [
            "<div><img src='" +
              obj.icon +
              "'><span style='padding-left:5px;font-size: 14px;font-weight:600;display:inline-block;height:24px;line-height:24px;'>消防栓</span>",
            "<div style='padding:0px 4px'><b style='font-size:18px;padding-bottom:10px;display: inline-block;'>" +
              obj.title +
              "</b>",
            "<span style='padding-bottom:5px;display: inline-block;'>地址:&nbsp;" +
              obj.address +
              "</span>",
            // "<span style='padding-bottom:5px;display: inline-block;'>水源类型编码:&nbsp;" + obj.type + "</span>",
            // "<span style='padding-bottom:5px;display: inline-block;'>水源状态:&nbsp;" + obj.status + "</span>",
            // "<span style='padding-bottom:5px;display: inline-block;'>取水方式:&nbsp;" + obj.fetch + "</span>",
            "<span style='padding-bottom:5px;display: inline-block;'>更新时间:&nbsp;" +
              obj.refreshTime +
              "</span></div></div>",
          ];
          break;
        case "pub_fh_xfz": //微型消防站
          // 折线的节点坐标数组，每个元素为 AMap.LngLat 对象
          content = [
            "<div><img src='" +
              obj.icon +
              "'><span style='padding-left:5px;font-size: 14px;font-weight:600;display:inline-block;height:24px;line-height:24px;'>微站</span>",
            "<div style='padding:0px 4px'><b style='font-size:18px;padding-bottom:10px;display: inline-block;'>" +
              obj.title +
              "</b>",
            "<span style='padding-bottom:5px;display: inline-block;'>编号:&nbsp;" +
              obj.areaCode +
              "</span>",
            "<span style='padding-bottom:5px;display: inline-block;'>所属区域:&nbsp;" +
              obj.areaCode +
              "</span>",
            "<span style='padding-bottom:5px;display: inline-block;'>联系人:&nbsp;" +
              obj.lxr +
              "</span>",
            "<span style='padding-bottom:5px;display: inline-block;'>联系电话:&nbsp;" +
              obj.phone +
              "</span>",
            "<span style='padding-bottom:5px;display: inline-block;'>状态:&nbsp;" +
              (obj.zt == 1 ? "可用" : "不可用") +
              "</span>",
            "<span style='padding-bottom:5px;display: inline-block;'>备注:&nbsp;" +
              obj.bz +
              "</span>",
            "<span style='padding-bottom:5px;display: inline-block;'>更新时间:&nbsp;" +
              obj.refreshTime +
              "</span></div></div>",
          ];
          break;
        case "t_catalog_list": //固定摄像头
          content = [
            "<div style='padding:0px 4px'><b style='font-size:18px;padding-bottom:10px;display: inline-block;'>" +
              obj.title +
              "</b>",
            "</div>",
          ];
          break;
        case "ol_incident24": //附近警情
          // 折线的节点坐标数组，每个元素为 AMap.LngLat 对象
          content = [
            "<div><img src='" +
              obj.icon_ +
              "'><b style='font-size:25px;padding-bottom:10px;display: inline-block;padding-left:10px'>" +
              obj.AJLX +
              "</b> ",
            "<div style='padding:0px 4px'><b style='font-size:18px;padding-bottom:10px;display: inline-block;'>" +
              obj.title +
              "</b>",
            "<div><button id='ol_incident24' style='color: #fff;background: #1890ff;border-color: #1890ff;text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);box-shadow: 0 2px 0 rgb(0 0 0 / 5%);padding: 8px 20px;outline: 0;box - shadow: none;float: right; ' data='" +
              JSON.stringify(obj) +
              "'>查看详情</button><button id='ol_incident24_detail' style='color: #fff;background: #ff6d18;border-color: #ffb818;margin-right:10px;text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);box-shadow: 0 2px 0 rgb(0 0 0 / 5%);padding: 8px 20px;outline: 0;box - shadow: none;float: right; ' data='" +
              JSON.stringify(obj) +
              "'>单位信息</button></div>",
            "</div>",
          ];
          break;
        case "incident_xiaquduizhan": //辖区队站
          // 折线的节点坐标数组，每个元素为 AMap.LngLat 对象
          content = [
            "<div><img src='" + obj.icon + "'> ",
            "<div style='padding:0px 4px'><b style='font-size:18px;padding-bottom:10px;display: inline-block;'>" +
              obj.title +
              "</b>",
            "</div></div>",
          ];
          break;
        default:
          break;
      }
      // 创建 infoWindow 实例
      const infoWindow = new this.AMap.InfoWindow({
        anchor: "top-left",
        content: content.join("<br>"), //传入 dom 对象，或者 html 字符串
        offset: new this.AMap.Pixel(0, 0),
      });
      return infoWindow;
    },
    /**
     * 打开自定义窗体
     * @params infoWindow 窗体对象
     */
    openInfoWindow_GaoDe(infoWindow, lng, lat) {
      infoWindow.open(this.map, [lng, lat]);
    },
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
        this.AMap = AMap;
        //设置底图属性
        this.map = new this.AMap.Map("mapContainer", {
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
        let disProvince = new this.AMap.DistrictLayer.Province({
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

        disProvince.setMap(this.map); //区域图加入到地图中
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
      if (this.$store.state.appRecentIncidentList.length > 0) {
        this.incidentMarker(this.$store.state.appRecentIncidentList);
      } else {
        this.removeOl_GaoDe("ol_incident24");
      }
    },
  },
  destroyed() {
    this.map.destroy(); //销毁地图
  },
};
</script>
