# vue-three-sdt

一个展示三维模型的Vue组件，支持fbx，glb，json文件。

## Install
using npm
```
npm i vue-three-sdt
```

## 使用
```vue
<template>
  <model-json src="example/models/obj/LeePerrySmith.obj"></model-json>
</template>
<script>
import { ModelJson } from 'vue-three-sdt';
export default {
  components: { ModelJson }
}
</script>
```

## Documents
### props
| prop            | type          | default              |  example                                   |
| --------------- |---------------|----------------------|--------------------------------------------|  
| src             | string        | -                    | './exapmle.obj'                            |
| width           | number        | -                    | 300                                        |
| height          | number        | -                    | 300                                        |
| position        | object        | { x: 0, y: 0, z: 0 } | { x: 100, y: 20, z: -10 }                  |
| rotation        | object        | { x: 0, y: 0, z: 0 } | { x: Math.PI / 2, y: 0, z: - Math.PI / 4 } |
| cameraPosition  | object        | { x: 0, y: 0, z: 0 } | { x: 1, y: 2, z: -3 } |
| cameraRotation  | object        | { x: 0, y: 0, z: 0 } | { x: 3, y: 2, z: -1 } |
| scale           | object        | { x: 1, y: 1, z: 1 } | { x: 2, y: 2, z: 3 }                       |
| lights          | array         | -                    |                                            |
| backgroundColor | number/string | 0xffffff             | 0xffffff/'#f00'/'rgb(255,255,255)'         |
| backgroundAlpha | number        | 1                    | 0.5                                        |
| controlsOptions | object        | -                    | see [OrbitControls Properties](https://threejs.org/docs/#examples/en/controls/OrbitControls) |
| crossOrigin     | string        | anonymous            | anonymous/use-credentials                  |
| outputEncoding     | number       | THREE.LinearEncoding                | see [WebGLRenderer OutputEncoding](https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer.outputEncoding)                                 |
| glOptions       | object        | { antialias: true, alpha: true }  | see [WebGLRenderer Parameters](https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer) |
| labelList       | Array         | []                   | 风量数据 [{text: '32m³/min',name: '120-119', num: 32}]  |
| isEdit          | Boolean       | false               | 是否开启编辑页面                            |
|rwColorNums      | Array         | [261.3, 52.8, 27.5, 9.6, 0.6, 0] | 根据风量改变巷道颜色   |
### events

| event         |
| ------------- |
| on-click      | 单击
| on-load       | 加载完成
| on-progress   | 正在加载
| on-error      | 错误
| on-dblclick   | 双击
| end-draw      | 结束绘制,返回新增模型和拆分模型[[],[]]
| on-cartoon    | 返回控制动画类
| on-model      | 返回模型操作类
| delete-model  | 删除模型，返回删除模型名称
| save-model    | 保存模型

## 模型格式
| model format  | component tag     |
| ------------- |-------------------|
| json          | \<model-json>     |
| fbx           | \<model-fbx>      |
| gltf(2.0)     | \<model-gltf>     |