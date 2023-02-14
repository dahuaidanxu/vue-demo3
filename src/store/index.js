import Vue from 'vue'
import Vuex from 'vuex'
// 引入 axios
import axios from 'axios'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    appTestVal: '丁丁',
    appTestNum: 0,
    appThemeType: '',  //主题类型
    appRecentIncidentList: [], //24警情列表
    appUnitList: [],//消防站列表
    appRequestURL: {
      caseRecentData: '/testAPI/iecs-dispatch/v1.1/plan/incident/recent?ip=10.32.63.23', //24小时警情接口测试用
      convertURL_GaoDe: 'https://restapi.amap.com/v3/assistant/coordinate/convert?',//高德坐标转换API
    }
  },
  getters: {
  },
  mutations: {

    //修改主题颜色
    changeThemeType(state, val) {
      state.appThemeType = val;
    },
    //24小时警情定时刷新
    changeRecentIncidentList(state, val) {
      state.appRecentIncidentList = val;
    },
    change1(state, obj) {
      setTimeout(() => {
        state.appTestVal = obj.name;
        state.appTestNum = obj.num;
      }, 1000)
    },
    //更新消防站列表
    changeUnitList(state, list) {
      let arr = [];
      list.forEach(l => {
        if (l.properties && l.properties.jd && l.properties.wd && l.properties.jgid) {
          let flg = {
            name: l.properties.jgjc || '无名称',
            desc: l.properties.jgms || "无描述",
            lng: l.properties.jd,
            lat: l.properties.wd,
            jgid: l.properties.jgid
          };
          arr.push(flg);
        }
      })
      state.appUnitList = arr;
    }

  },
  actions: {
    asyncChange(state, obj) {
      setTimeout(() => {
        state.commit('change1', obj)
      }, 1000)
    },
    //24小时警情定时刷新
    asyncRecentIncidentList(state) {
      axios({
        method: 'get',
        url: state.state.appRequestURL.caseRecentData,
      }).then(async res => {
        if (res.data.code == 0) {
          res.data.incident.forEach(c => {
            if (c.LASJ) {
              c.LASJ = formatterTime(c.LASJ);
            }
          })
          state.commit('changeRecentIncidentList', await formatterInc(res.data.incident));
        }
      }, error => {
        this.$Message.error('24小时警情接口请求失败' + error);
        state.commit('changeRecentIncidentList', []);
      })

      function formatterTime(time) {
        let tt = new Date(time * 1);
        return tt.getFullYear() + '/' + (tt.getMonth() + 1) + '/' + tt.getDate() + ' ' + tt.getHours() + ':' + tt.getMinutes() + ':' + tt.getSeconds();
      }

      async function formatterInc(list) {
        let res = list.filter((i) => isLnglatLegal(i.X, i.Y));
        let webApiKey = '2c38e888b060cdb41e4ce64a848cf0d8';
        let coordsys = 'gps';
        //解决高德批量转换经纬度一次只能转40次的问题
        let num = Math.ceil(res.length / 40);
        for (var i = 1; i <= num; i++) {
          let locations = '';
          for (var j = (i - 1) * 40; j < ((num == i) ? res.length : i * 40); j++) {
            locations += res[j].X + ',' + res[j].Y + '|';
          }
          let convert = await axios({ method: 'get', url: `https://restapi.amap.com/v3/assistant/coordinate/convert?key=${webApiKey}&locations=${locations}&coordsys=${coordsys}` });
          convert = convert.data.locations.split(';')
          for (var k = (i - 1) * 40; k < ((num == i) ? res.length : i * 40); k++) {
            res[k].lng_GaoDe = (convert[k % 40].split(','))[0];
            res[k].lat_GaoDe = (convert[k % 40].split(','))[1];
            // res[k].icon = that.factoryService.getIncidentIcon(res[k].AJLXDM, res[k].ZT).icon
          }
        }
        return res;

        /**判断是否是合法经纬度**/
        function isLnglatLegal(lng, lat) {
          return lng && lat && lng * 1 < 180 && lat * 1 < 90 && lng * 1 > 0 && lat * 1 > 0 ? true : false;
        }
      }
    },
    setIntervalRencentIncident(state, time) {
      setInterval(() => {
        state.dispatch('asyncRecentIncidentList');
      }, time)
    }
  },
  modules: {
    baseModules: {
      state: {
        username: 'dx'
      },
      mutations: {
        change2(state) {
          state.username = state.username == 'dx' ? 'sl' : 'dx';

        }
      }
    }
  }
})
