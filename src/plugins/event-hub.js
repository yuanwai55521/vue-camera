import _ from 'lodash';

// 用户管理实例中全局事件监听
class SubEventsManager {
  // eventHub = null;
  // _events = {};
  constructor(eventHub) {
    this.eventHub = eventHub;
  }
  addEvent(events, callback) {
    _.each(_.flatten(_.compact([events])), event => {
      if (!this._events[event]) {
        this._events[event] = [];
      }
      this._events[event].push(callback);
    });
  }
  removeEvent(events, callback) {
    _.each(_.flatten(_.compact([events])), event => {
      if (this._events[event]) {
        if (!_.isFunction(callback)) {
          this._events[event] = null;
        } else {
          this._events[event] = _.filter(this._events[event], handler => handler !== callback);
        }
      }
    });
  }
  offAllEvents() {
    _.each(this._events, (handlers, event) => {
      _.each(handlers, handler => {
        handler && this.eventHub.$off(event, handler);
      });
    });
  }
}

/**
 * 全局事件
 */
export default {
  install(Vue, options) {
    const eventHub = new Vue();
    // 发布
    // api和vue的$emit一模一样
    Vue._eventHub = eventHub;
    Vue.prototype.$pub = (...args) => {
      eventHub.$emit.apply(eventHub, _.toArray(args));
    };

    // 订阅
    // api和vue的$on一模一样
    Vue.prototype.$sub = function (event, callback) {
      this.$_subManager.addEvent(event, callback);
      eventHub.$on(event, callback);
    };

    // 取消订阅
    // api和vue的$off一模一样
    Vue.prototype.$unsub = function (event, callback) {
      this.$_subManager.removeEvent(event, callback);
      eventHub.$off.apply(eventHub, _.toArray(arguments));
    };

    Vue.mixin({
      created() {
        // 创建了实例的全局事件管理器
        if (!this.$_subManager) {
          this.$_subManager = new SubEventsManager(eventHub);
        }
      },
      // 在组件销毁时取消和本实例相关的所有全局监听器
      beforeDestroy() {
        this.$_subManager.offAllEvents();
      }
    });
  }
};
