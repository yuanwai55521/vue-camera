<template lang="pug">
  div.app
    Button.btn(type="primary" @click="$refs.camera.show()") 扫描
    camera(ref="camera")
</template>

<script>
import camera from './camera/main'
export default {
  components: { camera },
  data() {
    return {
    };
  }
};
</script>

<style lang="less">
.app {
  .btn {
    margin: 2rem 2rem;
  }
}
</style>
