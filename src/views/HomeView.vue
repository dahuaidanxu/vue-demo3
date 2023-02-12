<style lang="scss">
.home {
  @import '../assets/style/theme.scss';
  width: 100%;
  height: calc(100% - 60px);
  overflow: hidden;

  @include app-body1();
}
</style>
<template>
  <div class="home">
    <AppMap />
  </div>
</template>

<script>
// @ is an alias to /src
import AppMap from '@/components/Map.vue'

export default {
  components: {
    AppMap
  }
}
</script>
