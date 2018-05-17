<template lang="pug">
  Modal.cameraModel(v-model="visible" title="证件扫描" :maskClosable="false" :closable="false" width='1500')
    div.content
      scan-doc(ref="scanDoc" @on-imgDataChange="onImgDataChange").left
      img-operation(ref="imgOperation" @updateImgData="updateImgData" :initImgData="initImgData").right
    Button(slot="footer" @click="visible=false") 取消
    Button(slot="footer" type="primary" @click="okHandler") 确认
</template>

<script>
import scanDoc from "./scan-doc";
import imgOperation from "./img-operation";
import _ from 'lodash';

export default {
  components: { scanDoc, imgOperation },
  data() {
    return {
      visible: false,
      initImgData: []
    };
  },
  watch: {
    visible(nv) {
      if (!nv) {
        this.reset();
      };
    }
  },
  mounted() {
    this.$refs.scanDoc.$watch('imgDataArr', nv => {
      this.initImgData = nv;
    }, { deep: true });
  },
  methods: {
    show() {
      this.visible = true;
    },
    /* 桥接：点击某个截取的图像时，将该图像画到canvas中 */
    onImgDataChange(imgdata) {
      if (imgdata) {
        this.$refs.imgOperation.setCanvasImg(imgdata);
      };
    },
    /* 桥接：将修改后的图像信息更新到图像列中 */
    updateImgData(imgdata) {
      this.$refs.scanDoc.updateImgData(imgdata);
    },
    /* 将所有处理完毕的图像传到上级 */
    okHandler() {
      this.$emit('getImgOperation', _.cloneDeep(this.initImgData));
      this.visible = false;
    },
    /* 重置 */
    reset() {
      this.$refs.scanDoc.reset();
      this.$refs.imgOperation.reset();
    }
  }
};
</script>

<style lang="less">
.cameraModel {
  .content {
    width: 100%;
    height: 50rem;
    overflow-y: auto;
    .left,
    .right {
      width: 50%;
      height: 100%;
      overflow-y: auto;
    }
    .left {
      border-right: 1px solid #aaa;
      float: left;
    }
    .right {
      float: right;
    }
  }
}
</style>
