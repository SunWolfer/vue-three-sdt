import Vue from 'vue'

import ModelFbx from './components/vue-3d/model-fbx.vue'
import ModelJson from './components/vue-3d/model-json.vue'
import ModelGltf from './components/vue-3d/model-gltf.vue'

const components = [
	ModelFbx,
	ModelJson,
	ModelGltf
]

/* eslint-disable no-shadow */
const install = (Vue) => {
  components.forEach(component => {
		Vue.component(component.name, component)
	})
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
	ModelFbx,
	ModelJson,
	ModelGltf
}
export {
	ModelFbx,
	ModelJson,
	ModelGltf
}