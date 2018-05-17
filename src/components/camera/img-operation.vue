<template lang="pug">
  div.img-operation
    canvas.viewCanvas(ref="viewCanvas" width="600px" height="450px")
    ul.btn-group
      li
        Input(v-model="currentImgData.mc" style="width:80px;" placeholder="图像名称")
      li
        Button(@click="cutout" :disabled="operationBtnFlag.cutout") 剪裁图像
      li
        Button(@click="addText" :disabled="operationBtnFlag.addText") 添加标注
      li
        Button(@click="addImg" :disabled="operationBtnFlag.addImg") 添加图像
      li
        Button(type="primary" @click="saveChanged") 保存修改
    div.operation.pl2(v-show="operationItemFlag.cutout")
      Row.mt2
        Col(span="24")
          Button.right(style="width:5rem;" @click="cancelCutout") 取消
    div.operation.pl2(v-show="operationItemFlag.addText")
      Row.mt2
        Col(span="3")
          span 标注内容：
        Col(span="8")
          Input(v-model="calloutText.content" size="small" placeholder="请输入标注内容..." style="width:100%;")
        Col.center(span="2")
          span X轴:
        Col(span="11")
          Slider(v-model="calloutText.x" :tip-format="hideFormat" :max="99")
      Row.mt2
        Col(span="3")
          span 字体大小：
        Col(span="8")
          InputNumber(:min="12" v-model="calloutText.fontSize" size="small" style="width:5rem;")
        Col.center(span="2")
          span Y轴:
        Col(span="11")
          Slider(v-model="calloutText.y" :tip-format="hideFormat" :min="1")
      Row.mt2
        Col(span="3")
          span 标注颜色：
        Col(span="8")
          input(type="color" v-model="calloutText.color")
        Col(span="13")
          Button.right(style="width:5rem;" @click="cancelTextAdd") 取消
          Button.right(style="width:5rem;margin-right:1rem;" @click="resetText") 重置
    div.operation.pl2.pt1(v-show="operationItemFlag.addImg")
      Row.mt2
        Col(span="12")
          span 选择合并的位置：
          Select(v-model="direction" size="small" style="width:120px" transfer)
            Option(v-for="item in mergeDirection" :value="item.value" :key="item.value") {{ item.label }}
        Col(span="12" v-show="!selectedLocalImg")
          span 选择扫描的图像：
          Select(v-model="mergeBase" size="small" style="width:120px" transfer clearable)
            Option(v-for="item in imgDataArr" :value="item.base" :key="item.base") {{ item.mc }}
      Row.mt2
        Col(span="12")
          span 选择重合的方式：
          Select(v-model="selectedCoincideStyle" size="small" style="width:120px" transfer :disabled="direction!=='coincide'")
            Option(v-for="item in coincideStyle" :value="item.value" :key="item.value") {{ item.label }}
        Col(span="12" v-show="!mergeBase")
          span 选择本地的图像：
          input.file(ref="file" type="file" accept=".jpg, .png, .gif")
      Row.mt3
        Col(span="24")
          Button.right(style="width:5rem;" @click="cancelImgAdd") 取消
          Button.right(style="width:5rem;margin-right:1rem;" @click="resetImgAdd") 重置
          Button.right(style="width:5rem;margin-right:1rem;" @click="application") 应用
    coincide(ref='coincide' @getCoincideImgBase="getCoincideImgBase")
</template>

<script>
import ViewCanvas from './canvashelper';
import coincide from './coincide';
import _ from 'lodash';

const defaultCalloutText = { content: null, fontSize: 16, color: '#FF0000', x: 10, y: 10 };
export default {
  components: { coincide },
  props: {
    initImgData: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      calloutText: _.cloneDeep(defaultCalloutText),
      operationBtnFlag: { cutout: true, addText: true, addImg: true },
      operationItemFlag: { cutout: false, addText: false, addImg: false },
      currentImgData: { base: '', mc: '' },
      GC: null,
      flag: false,
      direction: null,
      mergeDirection: [
        { label: '上方', value: 'top' },
        { label: '右方', value: 'right' },
        { label: '下方', value: 'bottom' },
        { label: '左方', value: 'left' },
        { label: '重合', value: 'coincide' }
      ],
      coincideStyle: [
        { label: '在上', value: 'up' },
        { label: '在下', value: 'down' }
      ],
      selectedCoincideStyle: '',
      imgDataArr: this.initImgData,
      mergeBase: '',
      selectedLocalImg: ''
    };
  },
  computed: {
    addImgReady() {
      if (this.direction) {
        if (this.mergeBase || this.selectedLocalImg) {
          return true;
        } else {
          return false;
        };
      } else {
        return false;
      }
    }
  },
  watch: {
    calloutText: {
      handler(nv) {
        if (nv.content) this.useCalloutText(nv)
      },
      deep: true
    },
    initImgData: {
      handler(nv) {
        this.imgDataArr = _.cloneDeep(nv);
        if (_.isEmpty(nv)) {
          this.resetCanvas();
        } else {
          let is = _.findIndex(this.imgDataArr, item => item.id === this.currentImgData.id);
          if (is === -1 && this.flag) {
            this.setCanvasImg(this.imgDataArr[0]);
            this.resetCanvas();
          };
        }
      },
      deep: true
    }
  },
  mounted() {
    this.$refs.file.onchange = (e) => {
      this.selectedLocalImg = (window.URL || window.webkitURL).createObjectURL(this.$refs.file.files[0]);
    };
  },
  methods: {
    /* 初始化工具 */
    initial() {
      this.GC = new ViewCanvas();
      this.GC.initial({
        canvas: this.$refs.viewCanvas
      });
      this.GC.setFeatures("dragOn", true);
      this.flag = true;
    },
    /**
     * 将图像画到canvas中
     * @param {Array} imgdata - 图像信息（base: 图像的base64，id: 图像的标识，mc: 图像的名称）
     * @param {Boolean} tough - 是否强制画入
    */
    setCanvasImg(imgdata, tough) {
      if (!this.flag) {
        this.initial();
      };
      if (imgdata.base !== this.currentImgData.base || tough) {
        this.GC.setFeatures("ScaleOn", false);
        this.GC.setImage(imgdata.base);
        if (imgdata.base !== this.currentImgData.base) {
          this.currentImgData = imgdata;
          this.btnFlag(null, null, true);
          this.itemFlag(null, true, null);
        };
        this.resetText();
      };
    },
    /* 重置画布 */
    resetCanvas() {
      if (!this.GC) return;
      this.GC.resetAllCanvas();
      this.currentImgData = { base: '', mc: '' };
      this.btnFlag(null, true, false);
      this.itemFlag(null, true, null);
    },
    /**
     * 操作按钮控制
     * @param {String} item - 某一项可用
     * @param {Boolean} alltrue - 是否全部禁用
     * @param {Boolean} allfalse - 是否全部可用
    */
    btnFlag(item, alltrue, allfalse) {
      _.each(this.operationBtnFlag, (val, key) => {
        if (alltrue) {
          this.operationBtnFlag[key] = true;
        } else if (allfalse) {
          this.operationBtnFlag[key] = false;
        } else if (item === key) {
          this.operationBtnFlag[key] = false;
        } else {
          this.operationBtnFlag[key] = true;
        }
      });
    },
    /**
     * 操作项控制
     * @param {String} item - 某一项显示
     * @param {Boolean} allfalse - 是否全部影藏
    */
    itemFlag(item, allfalse) {
      _.each(this.operationItemFlag, (val, key) => {
        if (allfalse) {
          this.operationItemFlag[key] = false;
        } else if (item === key) {
          this.operationItemFlag[key] = true;
        } else {
          this.operationItemFlag[key] = false;
        }
      });
    },
    /* 启用图像裁剪 */
    cutout() {
      this.btnFlag('cutout');
      this.itemFlag('cutout');
      this.GC.setFeatures("ScaleOn", true);
    },
    /* 取消图像裁剪 */
    cancelCutout() {
      this.setCanvasImg(this.currentImgData, true);
      this.btnFlag(null, null, true);
      this.itemFlag(null, true, null);
    },
    /* 启用添加标注 */
    addText() {
      this.btnFlag('addText');
      this.itemFlag('addText');
    },
    /* 向画布中更新标注 */
    useCalloutText(options) {
      this.GC.addText({
        font: `${options.fontSize}px 微软雅黑`,
        fillStyle: options.color,
        content: options.content,
        x: options.x,
        y: options.y
      })
    },
    /* 重置添加标注 */
    resetText() {
      this.GC.cancelTextAdd();
      this.calloutText = _.cloneDeep(defaultCalloutText);
    },
    /* 取消添加标注 */
    cancelTextAdd() {
      this.resetText();
      this.btnFlag(null, null, true);
      this.itemFlag(null, true, null);
    },
    /* 启用合并图像 */
    addImg() {
      this.btnFlag('addImg');
      this.itemFlag('addImg');
    },
    /** 
     * 合并图像点击应用
     * 判断方位、若为重合合并则定义上下层图像
     */
    application() {
      if (this.addImgReady) {
        if (this.direction === 'coincide') {
          if (this.selectedCoincideStyle) {
            let mergeImgbase = this.mergeBase ? this.mergeBase : this.selectedLocalImg;
            let coincideoptions = {
              downImgBase: '',
              upImgBase: ''
            };
            if (this.selectedCoincideStyle === 'up') {
              coincideoptions.downImgBase = this.currentImgData.base;
              coincideoptions.upImgBase = mergeImgbase;
            } else {
              coincideoptions.downImgBase = mergeImgbase;
              coincideoptions.upImgBase = this.currentImgData.base;
            };
            this.$refs.coincide.show(coincideoptions);
          } else {
            this.$Message.warning('请选择图像重合的方式');
          };
        };
        let options = { direction: this.direction, base: '' };
        this.mergeBase ? options.base = this.mergeBase : options.base = this.selectedLocalImg;
        this.GC.addImg(options);
      } else {
        this.$Message.warning('请选择合并位置或图像');
      };
    },
    /* 重合合并完成 */
    getCoincideImgBase(imgbase) {
      let updateCurrentImgData = _.assign({}, this.currentImgData, { base: imgbase });
      this.currentImgData = updateCurrentImgData;
      this.$emit('updateImgData', updateCurrentImgData);
      this.cancelImgAdd();
    },
    /* 取消图像合并 */
    cancelImgAdd() {
      this.resetImgAdd();
      this.btnFlag(null, null, true);
      this.itemFlag(null, true, null);
    },
    /* 重置图像合并 */
    resetImgAdd() {
      this.setCanvasImg(this.currentImgData, true);
      this.direction = '';
      this.mergeBase = '';
      this.selectedLocalImg = '';
      this.selectedCoincideStyle = '';
    },
    /**
     *  修改保存
     * 获取修改好的图像信息，并跟新到图像列中
     */
    saveChanged() {
      let base = null;
      if (!this.operationBtnFlag.cutout && this.operationBtnFlag.addText) {
        base = this.$refs.viewCanvas.toDataURL('image/png');
      } else {
        base = document.getElementsByClassName('noneCanvas')[0].toDataURL('image/png');
      };
      let imgdata = _.assign({}, this.currentImgData, { base: base });
      this.currentImgData = _.cloneDeep(imgdata);
      this.$emit('updateImgData', imgdata);
      this.GC.setFeatures("ScaleOn", false);
      this.GC.setImage(imgdata.base);
      this.calloutText = _.cloneDeep(defaultCalloutText);
      this.btnFlag(null, null, true);
      this.itemFlag(null, true, null);
      this.resetImgAdd();
    },
    /* 不显示滑块上的值（iview的滑块组件） */
    hideFormat() {
      return null;
    },
    /* 重置 */
    reset() {
      this.resetCanvas();
      this.currentImgData = { base: '', mc: '' };
      this.GC = null;
      this.flag = false;
      this.direction = null;
      this.selectedCoincideStyle = '';
      this.mergeBase = '';
      this.selectedLocalImg = '';
    }
  }
};
</script>

<style lang="less">
.img-operation {
  user-select: none;
  .viewCanvas {
    margin-left: 1rem;
    box-shadow: 1px 1px 10px 1px #aaa;
    background-color: #000;
  }
  .btn-group {
    list-style: none;
    position: absolute;
    top: 0.2rem;
    right: 0;
    width: 9%;
    li {
      text-align: center;
      margin: 1.3rem 0;
      cursor: pointer;
      border-radius: 8px;
    }
  }
  .operation {
    width: 83%;
    height: 12rem;
    border: 1px solid #fff;
    .ivu-row .ivu-col .ivu-slider .ivu-slider-wrap {
      margin: 8px 0;
    }
    .file {
      width: 5.3rem;
    }
  }
}
</style>
