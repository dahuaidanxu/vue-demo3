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
    appRequestURL: {
      caseRecentData: '/testAPI/iecs-dispatch/v1.1/plan/incident/recent?ip=10.33.115.24', //24小时警情接口测试用
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
    }
  },
  actions: {
    asyncChange(state, obj) {
      setTimeout(() => {
        state.commit('change1', obj)
      }, 1000)
    },
    //24小时警情定时刷新
    asyncRecentIncidentList(state, time) {
      setInterval(() => {
        axios({
          method: 'get',
          url: state.state.appRequestURL.caseRecentData,
        }).then(res => {
          if (res.data.code == 0) {
            res.data.incident.forEach(c => {
              if (c.LASJ) {
                c.LASJ = formatterTime(c.LASJ);
              }
            })
            state.commit('changeRecentIncidentList', res.data.incident);
          }
        }, error => {
          this.$Message.error('24小时警情接口请求失败' + error);
          state.commit('changeRecentIncidentList', []);
        })
      }, time)

      function formatterTime(time) {
        let tt = new Date(time * 1);
        return tt.getFullYear() + '/' + (tt.getMonth() + 1) + '/' + tt.getDate() + ' ' + tt.getHours() + ':' + tt.getMinutes() + ':' + tt.getSeconds();
      }
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
