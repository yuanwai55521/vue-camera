<template lang="pug">
  div.coincide(ref="coincide" v-if="visible")
    div.btn
      div(@click="saveCoincide")
        Icon(type="ios-checkmark-outline")
      div(@click="cancelCoincide")
        Icon.ml3(type="ios-close-outline")
</template>

<script>
import ViewCanvas from './canvashelpe';

export default {
  data() {
    return {
      visible: false,
      options: {},
      CD: null,
      canvas: null
    };
  },
  watch: {
    visible(nv) {
      if (!nv) {
        this.$refs.coincide.removeChild(document.querySelector('.coincideCanvas'));
        this.reset();
      };
    }
  },
  methods: {
    /**
     *  初始化canvas
     *  创建节点、画入图像，添加节点
     *  初始化工具类
     */
    initCanvas() {
      let canvasImg = new Image();
      canvasImg.src = this.options.downImgBase;
      canvasImg.addEventListener('load', () => {
        let canvas = document.createElement('canvas');
        canvas.width = canvasImg.width;
        canvas.height = canvasImg.height;
        canvas.style.width = `${canvasImg.width}px`;
        canvas.style.height = `${canvasImg.height}px`;
        canvas.className = 'coincideCanvas';
        let ctx = canvas.getContext('2d');
        ctx.drawImage(canvasImg, 0, 0, canvasImg.width, canvasImg.height);
        this.$refs.coincide.appendChild(canvas);
        this.canvas = canvas;
        this.CD = new ViewCanvas();
        this.CD.initial({
          canvas: document.querySelector('.coincideCanvas'),
          initCtxImg: _.cloneDeep(this.options.downImgBase)
        });
        this.CD.setFeatures("dragOn", true);
        this.CD.setFeatures("ScaleOn", true);
        this.CD.setImage(this.options.upImgBase, 'coincideCanvas');
      });
    },
    /* 保存当前重合合并的图像 */
    saveCoincide() {
      let coincideImgBase = this.canvas.toDataURL('image/png');
      this.$emit('getCoincideImgBase', coincideImgBase);
      this.visible = false;
    },
    /* 取消按钮 */
    cancelCoincide() {
      this.$Modal.confirm({
        title: '关闭',
        content: '是否保存当前修改？',
        width: 350,
        onOk: () => {
          this.saveCoincide();
        },
        onCancel: () => {
          this.visible = false;
        }
      });
    },
    /* model显示，调用初始化 */
    show(options) {
      this.options = _.cloneDeep(options);
      this.visible = true;
      this.initCanvas();
    },
    /* 重置 */
    reset() {
      this.options = false;
      this.CD = null;
      this.canvas = null;
    }
  }
};
</script>

<style lang="less">

.coincide {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  overflow-y: auto;
  canvas {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    background-color: #fff;
  }
  .btn {
    position: fixed;
    top: 2rem;
    right: 4rem;
    z-index: 100;
    div {
      display: inline-block;
      .ivu-icon {
        color: #ddd;
        font-size: 4rem;
        &:hover {
          color: #fff;
          cursor: pointer;
        }
      }
    }
  }
}
</style>