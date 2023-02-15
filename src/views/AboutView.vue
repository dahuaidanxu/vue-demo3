<style scoped lang="scss">
.main {
  @import "../assets/style/theme.scss";
  width: 100%;
  height: calc(100% - 60px);
  overflow: hidden;

  @include app-body1();

  .part-1 {
    width: 600px;
    height: 400px;
  }
}
</style>
<template>
  <div class="main">
    <div id="part1" class="part-1"></div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  mounted: function () {
    this.drawChart1();
  },
  methods: {
    drawChart1() {
      let chart = this.$echarts.init(document.getElementById("part1"));
      let option = {
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: "line",
            areaStyle: {},
          },
        ],
      };
      chart.setOption(option);
    }
  },
};
</script>