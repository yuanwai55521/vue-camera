import Vue from 'vue';

const comps = {
};
for (var key in comps) {
  if (comps.hasOwnProperty(key)) {
    var comp = comps[key];
    Vue.component(key, comp);
  }
};
