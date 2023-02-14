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

.switch-body {
  position: absolute;
  right: 5px;
  bottom: 5px;
  width: 60px;
  height: auto;
}
</style>
<template>
  <div class="main">
    <div id="mapContainer" class="map"></div>
    <div class="switch-body" v-if="switch1">
      <i-switch v-model="switch1" @on-change="changeStatus" size="large">
        <span slot="open">返回</span>
        <span slot="close">返回</span>
      </i-switch>
    </div>
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
        incident_xiaquduizhan: null //辖区队站
      },
      AMap: null,
      switch1: false,
      drivingList: []
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
    //返回到初始位置
    changeStatus(val) {
      if (!val) {
        this.originalLocation(); //回到初始位置

        this.removeOl_GaoDe("incident_xiaquduizhan"); //清除辖区队站

        this.clearDrivingLine_GaoDe(); //清除轨迹
      }
    },
    //点击上图警情事件
    showIncidentDetail(incident) {
      // console.log(incident);
      let type = "t_xiaofangzhan"; //表名

      //展示附近的辖区消防站->事发地的路线
      this.axios
        .get(
          `/testAPI/geoServerURL-new/geoserver/egis/wfs?service=WFS&version=1.0.0&request=GetFeature&typename=egis:${type}&outputFormat=application/json&CQL_FILTER=CONTAINS(geom,POINT(${incident.lng} ${incident.lat}))`
        )
        .then(
          res => {
            if (
              res &&
              res.data &&
              res.data.features &&
              res.data.features.length > 0
            ) {
              // console.log(res.data.features[0].properties.jgid);
              this.$store.state.appUnitList.forEach(u => {
                if (u.jgid === res.data.features[0].properties.jgid) {
                  //画辖区队站与轨迹
                  this.drawXiaquDuizhan(u);
                  this.drawUnit_drvingLine(u, incident.lng, incident.lat);

                  let marker1 = new this.AMap.Marker({
                    position: new this.AMap.LngLat(u.lng, u.lat)
                  });
                  let marker2 = new this.AMap.Marker({
                    position: new this.AMap.LngLat(incident.lng, incident.lat)
                  });
                  this.switchMapLocaiton([marker1, marker2]); //切换视野
                  this.switch1 = true; //打开还原按钮

                  return;
                }
              });
            } else {
              this.$Message.error("未找到该警情对应的辖区队站");
            }
          },
          error => {
            this.$Message.error("获取该警情所属辖区消防站请求失败" + error);
          }
        );
    },
    //画辖区队站
    drawXiaquDuizhan(unit) {
      const marker = {
        lng: unit.lng,
        lat: unit.lat,
        title: unit.name,
        icon: require("../assets/img/xiaquduizhan.svg"),
        zIndex: 12
      };

      //上图之前先清除之前已经上图的
      this.removeOl_GaoDe("incident_xiaquduizhan");
      //警情列表数据点位转换成marker格式
      let markerList = this.getFormatterMarkerList("incident_xiaquduizhan", [
        marker
      ]);
      //将marker放到overlayers中&&上图显示
      this.addResourceToOl_GaoDe(
        "incident_xiaquduizhan",
        this.getMarkerFormatter_GaoDe("incident_xiaquduizhan", markerList)
      );
    },
    //根据机构id画队站到警情点路线
    drawUnit_drvingLine(unit, lng, lat) {
      this.clearDrivingLine_GaoDe(); //画之前先清
      if (unit) {
        const startPoint = {
          lng: unit.lng * 1,
          lat: unit.lat * 1,
          address: unit.name
        };
        const endPoint = { lng: lng * 1, lat: lat * 1, address: "" };
        this.drawDrivingLine_GaoDe(
          startPoint,
          endPoint,
          async (status, result) => {
            if (status == "complete") {
              this.$Notice.open({
                title: "路径规划",
                desc: `该警情最近的消防站全路程：${(result.routes[0].distance / 1000).toFixed(
                  2
                )}KM,需要：${formatTime(result.routes[0].time)}到达`,
                duration: 10
              });
            } else {
              this.$Message.error("驾车路线规划失败");
            }
          }
        );
      } else {
        return;
      }
      // throw new Error('Method not implemented.');

      function formatTime(s) {
        let day = Math.floor(s / (24 * 3600)); // Math.floor()向下取整
        let hour = Math.floor((s - day * 24 * 3600) / 3600);
        let minute = Math.floor((s - day * 24 * 3600 - hour * 3600) / 60);
        // let second = s - day * 24 * 3600 - hour * 3600 - minute * 60;
        if (day == 0 && hour == 0 && minute == 0) {
          minute = 1;
        }
        let day_c =
          day > 0 ? day + '<span style="font-size:12px">天</span>' : "";
        let hour_c =
          hour > 0 ? hour + '<span style="font-size:12px">小时</span>' : "";
        let minute_c =
          minute > 0 ? minute + '<span style="font-size:12px">分钟</span>' : "";
        // let second_c = second >= 0 ? second + '<span style="font-size:12px">秒</span>' : '';

        return day_c + hour_c + minute_c;
      }
    },
    /**
     * 路径规划
     * @param type = address/lngLat  通过地址/经纬度来路径规划
     * @param startPoint  { lng: 118.796812, lat: 32.087768 }
     * @param endPoint  { lng: 118.796812, lat: 32.087768 }
     */
    drawDrivingLine_GaoDe(startPoint, endPoint, callback) {
      try {
        const driving = new this.AMap.Driving({
          map: this.map, //设置在此地图显示
          policy: this.AMap.DrivingPolicy.LEAST_TIME, // 驾车路线规划策略，AMap.DrivingPolicy.LEAST_TIME是最快捷模式
          hideMarkers: true, //设置隐藏路径规划的起始点图标 设置为true：隐藏图标；设置false：显示图标\n默认值为：false
          showTraffic: true, //设置是否显示实时路况信息，默认设置为true。 显示绿色代表畅通，黄色代表轻微拥堵，红色代表比较拥堵，灰色表示无路况信息。
          autoFitView: false, //用于控制在路径规划结束后，是否自动调整地图视野使绘制的路线处于视口的可见范围
          panel: null //结果列表的HTML容器id或容器元素，提供此参数后，结果列表将在此容器中进行展示。可选
        });

        this.drivingList.push(driving);

        driving.search(
          [startPoint.lng, startPoint.lat],
          [endPoint.lng, endPoint.lat],
          function(status, result) {
            // 未出错时，result即是对应的路线规划方案
            callback(status, result);
          }
        );
      } catch (error) {
        this.$Message.error("规划路线失败" + error);
      }
    },
    /**
     * 清除驾车路线
     */
    clearDrivingLine_GaoDe() {
      this.drivingList.forEach(d => {
        d.clear();
      });
      if (this.drivingList.length > 100) {
        this.drivingList = this.drivingList.slice(-30);
      }
    },
    //筛选辖区队站
    pickXiaquDuizhan(affiliation, lng, lat) {
      if (affiliation.features.length >= 1) {
        let unitList = JSON.parse(
          localStorage.getItem("FIRE_DEPARTMENT_LIST") || ""
        );
        //剔除消防站状态不是1的，剔除经纬度有问题的
        unitList.features = unitList.features.filter(
          item =>
            item.properties.jlzt == 1 &&
            this.commonService.isLnglatLegal(
              item.properties.jd,
              item.properties.wd
            )
        );
        affiliation.features.forEach(a => {
          unitList.features.forEach(u => {
            if (a.properties.jgid == u.properties.jgid) {
              a.jd = u.properties.jd;
              a.wd = u.properties.wd;
              a.jgjc = u.properties.jgjc;
            }
          });
        });

        if (affiliation.features.length > 1) {
          let flg = false;
          //2022/02/24 辖区图层有两个以上的取altmode为1的队站
          affiliation.features.forEach(u => {
            if (u.properties.altmode == 1) {
              flg = true;

              affiliation.features[0] = u;
            }
          });

          //如果获取的辖区图层里面没有altmode为1的，那就按照老方法，取距离近的
          if (!flg) {
            affiliation.features.forEach(u => {
              if (u.jd && u.wd) {
                u["line_distance"] = this.mapService.getDistance_GaoDe(
                  lng,
                  lat,
                  u.jd,
                  u.wd
                );
              }
            });

            affiliation.features = this.commonService.getSortArr(
              affiliation.features,
              "line_distance",
              true
            );
          }
        }

        return affiliation.features[0];
      } else {
        return null;
      }
    },
    //还原到初始位置
    originalLocation() {
      this.map.setZoomAndCenter(9.6, [120.620958, 31.450552]); //同时设置地图层级与中心点
    },
    // 点击警情显示点位与导航路径切换视野
    switchMapLocaiton(arr) {
      this.map.setFitView(arr);
    },
    //点位上图需要按照高德的形状修改
    getFormatterMarkerList(type, arrList) {
      let markerList = [];
      switch (type) {
        case "ol_incident24":
          arrList.forEach(r => {
            // 创建一个 Icon
            let startIcon = new this.AMap.Icon({
              // 图标尺寸
              // size: new  this.AMap.Size(30, 35),
              // 图标的取图地址
              image: r.icon ? r.icon : require("../assets/img/huozai.svg"),
              // 图标所用图片大小
              imageSize: new this.AMap.Size(35, 40)
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
              ZDDWID: r.ZDDWID || 0
            };
            markerList.push(marker);
          });
          break;
        case "incident_xiaquduizhan":
          arrList.forEach(r => {
            // 创建一个 Icon
            let startIcon = new this.AMap.Icon({
              // 图标尺寸
              // size: new  this.AMap.Size(30, 35),
              // 图标的取图地址
              image: r.icon
                ? r.icon
                : require("../assets/img/xiaquduizhan.svg"),
              // 图标所用图片大小
              imageSize: new this.AMap.Size(35, 40)
              // 图标取图偏移量
              // imageOffset: new  this.AMap.Pixel(-9, -3)
            });
            const marker = {
              lng: r.lng,
              lat: r.lat,
              title: r.title,
              icon: startIcon,
              icon_: r.icon
                ? r.icon
                : require("../assets/img/xiaquduizhan.svg"),
              zIndex: r.zIndex
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

      list.forEach(item => {
        let marker = new this.AMap.Marker({
          position: new this.AMap.LngLat(item.lng, item.lat), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          id: item.id || "",
          title: item.title || "测试",
          icon: item.icon || "../assets/shangtu/shifadi.svg",
          anchor: "center", //设置锚点 anchor 可选值有  'top-left'、'top-center'、'top-right'、'middle-left'、'center'、'middle-right'、'bottom-left'、'bottom-center'、'bottom-right'
          offset: item.offset || new this.AMap.Pixel(0, 0), //设置偏移量 通过设置 offset 来添加偏移量。当偏移量为 (0, 0) 时，自定义内容默认以左上角为基准点（若设置了 anchor，基准点位置则为 anchor 设置的位置）与经纬度坐标对齐；设置 offset 为其他值则对齐位置相应改变
          zIndex: item.zIndex ? item.zIndex : 1
        });
        markerList.push(marker);
        marker.on("mouseover", function() {
          if (type == "ol_incident24" || type == "incident_xiaquduizhan") {
            if (that.getInfoWindow_GaoDe(type, item)) {
              that.InfoWindow = that.getInfoWindow_GaoDe(type, item);
              that.openInfoWindow_GaoDe(that.InfoWindow, item.lng, item.lat);
            }
          }
        });
        marker.on("mouseout", function() {
          if (type == "ol_incident24" || type == "incident_xiaquduizhan") {
            if (that.getInfoWindow_GaoDe(type, item)) {
              that.closeInfoWindow_GaoDe(that.InfoWindow, item.lng, item.lat);
            }
          }
        });
        marker.on("click", function() {
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
        case "ol_incident24": //附近警情
          // 折线的节点坐标数组，每个元素为 AMap.LngLat 对象
          content = [
            "<div><img src='" +
              obj.icon_ +
              "'><b style='font-size:25px;padding-bottom:10px;display: inline-block;padding-left:10px'>" +
              obj.AJLX +
              "</b> ",
            "<div style='padding:0px 4px'><b style='font-size:18px;padding-bottom:10px;display: inline-block;color:#000;'>" +
              obj.title +
              "</b>",
            "</div></div>"
          ];
          break;
        case "incident_xiaquduizhan": //辖区队站
          // 折线的节点坐标数组，每个元素为 AMap.LngLat 对象
          content = [
            "<div><img src='" + obj.icon_ + "'> ",
            "<div style='padding:0px 4px'><b style='font-size:18px;padding-bottom:10px;display: inline-block;color:#000;'>" +
              obj.title +
              "</b>",
            "</div></div>"
          ];
          break;
        default:
          break;
      }
      // 创建 infoWindow 实例
      const infoWindow = new this.AMap.InfoWindow({
        anchor: "top-left",
        content: content.join("<br>"), //传入 dom 对象，或者 html 字符串
        offset: new this.AMap.Pixel(0, 0)
      });
      return infoWindow;
    },
    /**
     * 关闭自定义窗体
     * @params infoWindow 窗体对象
     */
    closeInfoWindow_GaoDe(infoWindow, lng, lat) {
      infoWindow.close(this.currentMap, [lng, lat]);
    },
    /**
     * 打开自定义窗体
     * @params infoWindow 窗体对象
     */
    openInfoWindow_GaoDe(infoWindow, lng, lat) {
      infoWindow.open(this.map, [lng, lat]);
    }
  },
  mounted: function() {
    let _window = window;
    _window._AMapSecurityConfig = {
      securityJsCode: "f63d39f0cddfabe2fa9a17b4a60d310c"
    };
    //初始化底图
    AMapLoader.load({
      key: "6fd31d05db0b59591f18a67ba452e1c1", // 申请好的Web端开发者Key，首次调用 load 时必填
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
        "AMap.GeoJSON"
      ] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
      .then(AMap => {
        this.AMap = AMap;
        //设置底图属性
        this.map = new this.AMap.Map("mapContainer", {
          resizeEnable: true, //是否监控地图容器尺寸变化
          zoom: 9.6, //初始地图级别
          center: [120.620958, 31.450552], //初始地图中心点
          viewMode: "3D", // 地图模式
          mapStyle:
            localStorage.getItem("APP-SKIN-TYPE") == "light"
              ? "amap://styles/normal"
              : "amap://styles/blue"
        });

        //南京市区域图边框效果初始化
        let disProvince = new this.AMap.DistrictLayer.Province({
          zIndex: 10,
          adcode: [320500],
          depth: 2,
          styles: {
            fill: ["rgb(0,0,0,0)"],
            "stroke-width": 3,
            "city-stroke": "#FFB05F", //中国地级市边界
            "county-stroke": "#0000" //中国区县边界
          }
        });

        disProvince.setMap(this.map); //区域图加入到地图中

        this.$store.dispatch("asyncRecentIncidentList");
      })
      .catch(e => {
        console.log(e);
      });
  },
  watch: {
    //监听换肤效果，切换底图效果
    "$store.state.appThemeType"() {
      this.map.setMapStyle(
        this.$store.state.appThemeType == "light"
          ? "amap://styles/normal"
          : "amap://styles/blue"
      );
    },

    //监听刷新的警情列表
    "$store.state.appRecentIncidentList"() {
      //警情列表上图
      if (this.$store.state.appRecentIncidentList.length > 0 && this.map) {
        this.incidentMarker(this.$store.state.appRecentIncidentList);
      } else {
        this.removeOl_GaoDe("ol_incident24");
      }
    }
  },
  destroyed() {
    this.map.destroy(); //销毁地图
  }
};
</script>
