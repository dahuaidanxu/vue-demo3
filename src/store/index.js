import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    appTestVal: '丁丁',
    appTestNum: 0,
    appThemeType:'',
    appRequestURL: {
      caseRecentData: '/testAPI/iecs-dispatch/v1.1/plan/incident/recent?ip=10.33.115.24', //24小时警情接口测试用
    }
  },
  getters: {
  },
  mutations: {
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
