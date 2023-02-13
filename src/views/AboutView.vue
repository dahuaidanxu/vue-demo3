<style scoped lang="scss">
.main {
  @import '../assets/style/theme.scss';
  width: 100%;
  height: calc(100% - 60px);
  overflow: hidden;

  @include app-body1();
}
</style>
<template>
  <div class="main">
    <h1 @click="change1">{{ $store.state.appTestVal }}:{{ $store.state.appTestNum }}</h1>
    <h1 @click="change2">{{ $store.state.baseModules.username }}</h1>
    <Button type="primary" @click="axiosTest">Axios测试</Button>
    <Modal v-model="modal1" title="接口数据" @on-ok="ok" @on-cancel="cancel">
      <Table :columns="columns1" :data="caseRecentData"></Table>
    </Modal>
  </div>

</template>
<script>
export default {
  data() {
    return {
      modal1: false,
      caseRecentData: [],
      columns1: [

        {
          title: '时间',
          key: 'LASJ'
        },
        {
          title: '地址',
          key: 'DZ'
        },
        {
          title: '描述',
          key: 'AJMS'
        }
      ]
    }
  },
  methods: {
    change1() {
      this.$store.commit('change1', { name: '沈丽', num: 1 * Math.random() });
      console.log(this.$store);
    },
    change2() {
      this.$store.commit('change2', 'xx')
    },
    axiosTest() {
      this.modal1 = true;
      this.axios.get(this.$store.state.appRequestURL.caseRecentData).then(res => {
        console.log(res);
        if (res.data.code == 0) {
          this.$Message.success('请求成功');
          this.caseRecentData = res.data.incident;
          this.caseRecentData.forEach(c => {
            if (c.LASJ) {
              c.LASJ = this.formatterTime(c.LASJ);
            }
          })
        }
      }, error => {
        this.$Message.error('请求失败' + error);
        this.caseRecentData = [];
      })
    },
    ok() {
      this.$Message.info('点击了确定');
    },
    cancel() {
      this.$Message.info('点击了取消');
    },
    formatterTime(time) {
      let tt = new Date(time * 1);
      return tt.getFullYear() + '/' + (tt.getMonth() + 1) + '/' + tt.getDate() + ' ' + tt.getHours() + ':' + tt.getMinutes() + ':' + tt.getSeconds();
    }
  }
}
</script>