<template>
	<div ref="myThreeCas" style="width: 100%; height: 100%; margin: 0; border: 0; padding: 0;position: relative;">
		<canvas ref="canvas" style="width: 100%; height: 100%;"></canvas>
		<editArea v-if="isEdit" @optBtn="optBtn" @save-model="saveModel"></editArea>
		<div class="pmBtn" v-if="isRedact" @click="setPM()">
			<label style="float: left;">平面高度</label>
			<input v-model="planeHei" />
			<label style="float: left;">起点高度</label>
			<input v-model="initPoint" />
		</div>
		<!-- 删除弹窗 -->
		<deleteDialog v-if="showDeleteDia" @close="showDeleteDia = false" @confirm="confirmDelete"></deleteDialog>
	</div>
</template>
<script>
import { Object3D, Vector2, Vector3, Color, Scene, Raycaster, WebGLRenderer, PerspectiveCamera, AmbientLight, PointLight, HemisphereLight, DirectionalLight } from 'three';
import * as THREE from 'three/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { getSizes, getCenter } from '../../utils/threeutil';
import { cartoonUtil, addModel } from '../../utils/threeutils';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

import { addAllWindDir, saveArrayBuffer, saveString, findCenterByPoint } from '../../utils/subVectors';

import editArea from '../edit-area/index.vue'
// 删除弹窗
import deleteDialog from '../deleteDialog/index.vue'

const suportWebGL = (() => {
	try {
		const canvas = document.createElement('canvas');
		return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
	} catch (e) {
		return false;
	}
})();
const DEFAULT_GL_OPTIONS = {
	antialias: true,
	alpha: true
};
let clock = new THREE.Clock();
// var gridImg = window.SITE_CONFIG['cdnUrl'] + '/file/gridding.jpg'
export default {
	props: {
		src: {
			type: String
		},
		objJSON: {
			type: String
		},
		width: {
			type: Number
		},
		height: {
			type: Number
		},
		position: {
			type: Object,
			default() {
				return { x: 0, y: 0, z: 0 };
			}
		},
		rotation: {
			type: Object,
			default() {
				return { x: 0, y: 0, z: 0 };
			}
		},
		scale: {
			type: Object,
			default() {
				return { x: 1, y: 1, z: 1 };
			}
		},
		lights: {
			type: Array,
			default() {
				return [];
			}
		},
		cameraPosition: {
			type: Object,
			default() {
				return { x: 0, y: 1000, z: 2000 };
			}
		},
		cameraRotation: {
			type: Object,
			default() {
				return { x: 0, y: 0, z: 0 };
			}
		},
		cameraUp: {
			type: Object
		},
		cameraLookAt: {
			type: Object
		},
		backgroundColor: {
			default: 0xffffff
		},
		backgroundAlpha: {
			type: Number,
			default: 1
		},
		controlsOptions: {
			type: Object
		},
		crossOrigin: {
			default: 'anonymous'
		},
		gammaOutput: {
			type: Boolean,
			default: false
		},
		glOptions: {
			type: Object
		},
		// 相机分辨率大小
		cameraSize: {
			type: Number,
			default() {
				return 1;
			}
		},
		showplane: {
			type: Boolean,
			default: true
		},
		// 标签列表
		labelList: {
			type: Array,
			default() {
				return [];
			}
		},
		isEdit: {
			type: Boolean,
			default: false
		},
		nodeColor: {
			type: String
		},
		rwColorNums: {
			type: Array,
			default() {
				return [261.3, 52.8, 27.5, 9.6, 0.6, 0]
			}
		}
	},
	components: {
		editArea,
		deleteDialog
	},
	data() {
		return {
			suportWebGL,
			size: {
				width: this.width,
				height: this.height
			},
			object: null,
			raycaster: new Raycaster(),
			mouse: new Vector2(),
			// camera: new PerspectiveCamera(40, 1, 0.0001, 5000000),
			camera: new PerspectiveCamera(40, 1, 0.1, 5000000),
			fakeCamera: '',
			scene: new Scene(),
			wrapper: new Object3D(),
			renderer: null,
			controls: null,
			transformControl: null,
			allLights: [],
			clock: typeof performance === 'undefined' ? Date : performance,
			reqId: null, // requestAnimationFrame id
			divIdArray: [], // 创建标签组
			composer: null,
			outlinePass: null,
			effectFXAA: null,
			selectedObjects: [],
			firstCameraPosition: [],
			changePosition: false,
			movelength: 1,
			mixer: null,
			modList: [],
			cameraUtils: null,
			newCartoon: null,
			newModel: null,
			initialCamera: 0, // 点击时相机位置
			planeModel: null, // 初始平面
			initModel: null, // 待添加模型
			myCenter: new Vector3(0, 0, 0),
			labelRenderer: new CSS2DRenderer(),
			moveTextures: [],
			// 开始编辑
			startRedact: false,
			planeHei: 0,
			initPoint: 0,
			// 是否编辑巷道
			isRedact: false,
			// 是否删除巷道
			isRemove: false,
			// 是否添加风门
			addDoor: false,
			// 是否添加风窗
			addWindow: false,
			// 是否添加传感器
			addSensor: false,
			// 是否显示风流
			isWind: false,
			isTSControl: false,
			// 待移动巷道
			dealRoadWay: [],
			showDeleteDia: false,
			rwColors: ['#FF96FF','#E400E4', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#000080', '#000040',]
		};
	},
	computed: {
		hasListener() {
			// 判断是否有鼠标事件监听，用于减少不必要的拾取判断
			/* eslint-disable no-underscore-dangle */
			const events = this._events;
			const result = {};
			const eventList = ['on-mousemove', 'on-mouseup', 'on-mousedown', 'on-click', 'on-dblclick', 'on-keydown', 'on-keyup'];
			eventList.forEach(name => {
				result[name] = !!events[name] && events[name].length > 0;
			});
			return result;
		}
	},
	mounted() {
		this.$el = this.$refs.canvas;
		if (this.width === undefined || this.height === undefined) {
			this.size = {
				width: this.$el.offsetWidth,
				height: this.$el.offsetHeight
			};
		}
		const options = Object.assign({}, DEFAULT_GL_OPTIONS, this.glOptions, {
			canvas: this.$refs.canvas
		});
		this.camera = new PerspectiveCamera(40, 1, this.cameraSize, 5000000);
		this.renderer = new WebGLRenderer(options);
		this.renderer.shadowMap.enabled = true;
		this.renderer.autoClear = false;
		this.renderer.antialias = true;
		this.renderer.alpha = true;
		this.renderer.gammaOutput = this.gammaOutput;
		this.fakeCamera = this.camera.clone();
		this.labelRenderer.domElement.style.position = 'absolute';
		this.labelRenderer.domElement.style.top = '0px';
		this.labelRenderer.setSize(this.size.width, this.size.height);
		this.labelRenderer.domElement.style.pointerEvents = 'none';
		this.$refs.myThreeCas.appendChild(this.labelRenderer.domElement)

		this.controls = new OrbitControls(this.camera, this.$el);
		this.controls.type = 'orbit';
		
		this.transformControl = new TransformControls(this.camera, this.$el);
		this.transformControl.addEventListener( 'change', this.render, false);
		this.transformControl.addEventListener( 'dragging-changed', this.onDraggingChanged, false)
		this.scene.add(this.transformControl)
		this.scene.add(this.wrapper);
		if (this.showplane) {
			this.setNewPlane();
		}
		this.load();
		this.update();
		
		// 移动控制器监听移动事件
		this.transformControl.addEventListener('objectChange', this.onObjectChange, false)
		
		this.$el.addEventListener('mousedown', this.onMouseDown, false);
		this.$el.addEventListener('mousemove', this.onMouseMove, false);
		this.$el.addEventListener('mouseup', this.onMouseUp, false);
		this.$el.addEventListener('click', this.onClick, false);
		this.$el.addEventListener('dblclick', this.onDblclick, false);
		window.addEventListener('resize', this.onResize, false);
		this.animate();
	},
	beforeDestroy() {
		cancelAnimationFrame(this.reqId);
		this.scene.dispose();
		this.renderer.dispose();
		if (this.controls) {
			this.controls.dispose();
		}
		if (this.transformControl) {
			this.transformControl.dispose()
		}
		this.$el.removeEventListener('mousedown', this.onMouseDown, false);
		this.$el.removeEventListener('mousemove', this.onMouseMove, false);
		this.$el.removeEventListener('mouseup', this.onMouseUp, false);
		this.$el.removeEventListener('click', this.onClick, false);
		this.$el.removeEventListener('dblclick', this.onDbclick, false);

		window.removeEventListener('resize', this.onResize, false);
		this.transformControl.removeEventListener('change', this.render, false)
		this.transformControl.removeEventListener('dragging-changed', this.onDraggingChanged, false)
		this.transformControl.removeEventListener('objectChange', this.onObjectChange, false)
		this.renderer.forceContextLoss();
		this.renderer = '';
	},
	watch: {
		src() {
			this.load();
		},
		objJSON() {
			this.load();
		},
		rotation: {
			deep: true,
			handler(val) {
				if (!this.object) return;
				this.object.rotation.set(val.x, val.y, val.z);
			}
		},
		position: {
			deep: true,
			handler(val) {
				if (!this.object) return;
				this.object.position.set(val.x, val.y, val.z);
			}
		},
		scale: {
			deep: true,
			handler(val) {
				if (!this.object) return;
				this.object.scale.set(val.x, val.y, val.z);
			}
		},
		lights: {
			deep: true,
			handler() {
				this.updateLights();
			}
		},
		size: {
			deep: true,
			handler() {
				this.updateCamera();
				this.updateRenderer();
			}
		},
		controlsOptions: {
			deep: true,
			handler() {
				this.updateControls();
			}
		},
		backgroundAlpha() {
			this.updateRenderer();
		},
		backgroundColor() {
			this.updateRenderer();
		},
		isWind() {
			this.windFlow();
		},
		planeHei() {
			// 改变平面高度
			this.changePlaneHeight();
		}
	},
	methods: {
		onResize() {
			if (this.width === undefined || this.height === undefined) {
				this.$nextTick(() => {
					if (this.$el.offsetWidth > 0) {
						this.size = {
							width: this.$el.offsetWidth,
							height: this.$el.offsetHeight
						};
						this.effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
					}
				});
			}
		},
		onMouseDown(event) {
			// if (!this.hasListener['on-mousedown']) return
			const intersected = this.pick(event.clientX, event.clientY);
			if (event.button == 0) {
				// this.$emit('on-leftmousedown', intersected);
			}
			if (event.button == 2) {
				// this.initialCamera = this.camera.position.y
				this.initialCamera = this.camera.position.clone();
				// this.$emit('on-rightmousedown', intersected);
			}
		},
		onMouseMove(event) {
			if (!this.showplane) return;
			// if (!this.hasListener['on-mousemove']) return
			// 判断是否开启编辑
			if (this.startRedact) {
				if (this.selectedObjects.length > 0) {
					this.selectedObjects[0].children = [];
				}
				this.selectedObjects = [];
			}

			const intersected = this.pick(event.clientX, event.clientY);
			if (event.buttons == 0) {
				// 编辑
				if (intersected && this.startRedact && intersected.object.name !== 'textcylinder') {
					if (intersected !== null) {
						this.selectedObjects.push(intersected.object);
					}
					this.outlinePass.selectedObjects = this.selectedObjects;
					this.newModel.mouseMoveCylinder({
						x: intersected.point.x,
						y: intersected.point.y,
						z: intersected.point.z
					});
				}
			} else if (event.buttons == 1) {
			} else if (event.buttons == 2) {
				let xChange = this.planeModel.position.x + this.camera.position.x - this.initialCamera.x;
				let yChange = this.planeModel.position.y + this.camera.position.y - this.initialCamera.y;
				let zChange = this.planeModel.position.z + this.camera.position.z - this.initialCamera.z;
				this.planeModel.position.set(xChange, yChange, zChange);
				this.planeHei = JSON.parse(JSON.stringify(yChange));
				this.initialCamera = this.camera.position.clone();
			}
		},
		onMouseUp(event) {
			// if (this.isTSControl) {
			// 	// 结束移动
			// 	this.transformControl.detach()
			// 	// 结束绘制
			// }
			if (!this.hasListener['on-mouseup']) return;

			// const intersected = this.pick(event.clientX, event.clientY);
			// this.$emit('on-mouseup', intersected);
		},
		onClick(event) {
			if (!this.hasListener['on-click']) return;
			if (this.selectedObjects.length > 0) {
				this.selectedObjects[0].children = [];
			}
			this.selectedObjects = [];
			const intersected = this.pick(event.clientX, event.clientY);
			if (intersected !== null) {
				this.selectedObjects.push(intersected.object);
			}
			// 判断是否删除
			if (this.isRemove && intersected && intersected.object.name !== 'planeModel') {
				this.showDeleteDia = true
			}
			// 判断是否添加模型
			if (this.addDoor || this.addWindow || this.addSensor) {
				let mType = this.addDoor ? '1' : this.addWindow ? '2' : this.addSensor ? '3' : '3';
				this.newModel.addSmallModel(
					{
						x: intersected.point.x,
						y: intersected.point.y,
						z: intersected.point.z
					},intersected.object,mType
				);
			}
			// 移动
			if (intersected && this.isTSControl) {
				let obj = intersected.object
				// 判断是否是节点
				if (obj.isMesh && obj.name.split('-').length == 1) {
					if ( obj !== this.transformControl.object ) {
						this.transformControl.attach( obj );
					}
					let tName = obj.name + ''
					this.dealRoadWay = []
					// 添加待移动模型
					this.object.traverse((child) => {
					  if (child.isMesh && child.name.indexOf(tName) != -1) {
							if (child.name.split('-').length > 1) {
								this.dealRoadWay.push(child)
							}
					  }
					})
				}
			}
			this.outlinePass.selectedObjects = this.selectedObjects;
			this.$emit('on-click', intersected, this.selectedObjects);
		},
		onDblclick(event) {
			// if (!this.hasListener['on-dblclick']) return
			// 判断是否开启编辑
			if (this.isRedact) {
				const intersected = this.pick(event.clientX, event.clientY);
				this.startRedact = !this.startRedact;
				// 找中心点
				let po = new Vector3(intersected.point.x, intersected.point.y, intersected.point.z)
				let obj = intersected.object
				if (obj.name !== 'planeModel') {
					if (obj.name.split('-').length > 1) {
						// 找中心点
						po = findCenterByPoint(po, obj, this.object)
					} else {
						po = obj.position
					}
				}
				if (this.startRedact) {
					this.newModel.addNewCylinder(po, obj)
					// 起始点
					this.initPoint = po.y
					this.planeHei = po.y
				} else {
					let changeModel = this.newModel.drawEnd(po, obj)
					this.$emit('end-draw', changeModel)
				}
				this.$emit('on-dblclick', intersected)
			}
		},
		onDraggingChanged (event) {
			this.controls.enabled = !event.value;
		},
		// 改变巷道连接
		onObjectChange () {
			let self = this
			for (let i = 0; i < this.dealRoadWay.length; i++) {
				this.newModel.removeModelByNames(this.dealRoadWay[i].name)
				this.$nextTick(() => {
					self.newModel.connectBall([self.dealRoadWay[i].name], this.dealRoadWay[i].material)
				})
			}
			// console.log(this.transformControl.object)
		},
		pick(x, y) {
			if (!this.object) return null;

			const rect = this.$el.getBoundingClientRect();

			x -= rect.left;
			y -= rect.top;

			this.mouse.x = (x / this.size.width) * 2 - 1;
			this.mouse.y = -(y / this.size.height) * 2 + 1;
			this.raycaster.setFromCamera(this.mouse, this.camera);
			// let vector = new THREE.Vector3(this.mouse.x, this.mouse.y,0.5).unproject(this.camera)
			const intersects = this.raycaster.intersectObject(this.isRedact ? this.wrapper : this.object, true);
			let obj = null;
			if ((intersects && intersects.length) > 0) {
				for (let i = 0; i < intersects.length; i++) {
					if (intersects[i].object.name !== 'textcylinder') {
						obj = intersects[i];
						break;
					}
				}
			}
			return obj;
		},
		update() {
			this.updateRenderer();
			this.updateCamera();
			this.updateLights();
			this.updateControls();
			this.updateClickDomColor();
		},
		updateModel() {
			const { object } = this;

			if (!object) return;

			const { position } = this;
			const { rotation } = this;
			const { scale } = this;

			object.position.set(position.x, position.y, position.z);
			object.rotation.set(rotation.x, rotation.y, rotation.z);
			object.scale.set(scale.x, scale.y, scale.z);
		},
		updateRenderer() {
			const { renderer } = this;

			renderer.setSize(this.size.width, this.size.height);
			renderer.setPixelRatio(window.devicePixelRatio || 1);
			renderer.setClearColor(new Color(this.backgroundColor).getHex());
			renderer.setClearAlpha(this.backgroundAlpha);
		},
		updateCamera() {
			const { camera } = this;
			const { object } = this;

			camera.aspect = this.size.width / this.size.height;
			camera.updateProjectionMatrix();
			if (!this.cameraLookAt && !this.cameraUp) {
				if (!object) return;

				const distance = getSizes(object).length();
				camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
				camera.rotation.set(this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z);

				if (this.cameraPosition.x === 0 && this.cameraPosition.y === 0 && this.cameraPosition.z === 0) {
					camera.position.z = distance;
				}

				camera.lookAt(new Vector3());
			} else {
				camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
				camera.rotation.set(this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z);
				camera.up.set(this.cameraUp.x, this.cameraUp.y, this.cameraUp.z);

				camera.lookAt(new Vector3(this.cameraLookAt.x, this.cameraLookAt.y, this.cameraLookAt.z));
			}
		},
		updateLights() {
			this.scene.remove(...this.allLights);
			this.allLights = [];
			this.lights.forEach(item => {
				if (!item.type) return;
				const type = item.type.toLowerCase();
				let light = null;
				if (type === 'ambient' || type === 'ambientlight') {
					const color = item.color === 0x000000 ? item.color : item.color || 0x404040;
					const intensity = item.intensity === 0 ? item.intensity : item.intensity || 1;
					light = new AmbientLight(color, intensity);
				} else if (type === 'point' || type === 'pointlight') {
					const color = item.color === 0x000000 ? item.color : item.color || 0xffffff;
					const intensity = item.intensity === 0 ? item.intensity : item.intensity || 1;
					const distance = item.distance || 0;
					const decay = item.decay === 0 ? item.decay : item.decay || 1;
					light = new PointLight(color, intensity, distance, decay);
					if (item.position) {
						light.position.copy(item.position);
					}
				} else if (type === 'directional' || type === 'directionallight') {
					const color = item.color === 0x000000 ? item.color : item.color || 0xffffff;
					const intensity = item.intensity === 0 ? item.intensity : item.intensity || 1;
					light = new DirectionalLight(color, intensity);
					if (item.position) {
						light.position.copy(item.position);
					}
					if (item.target) {
						light.target.copy(item.target);
					}
				} else if (type === 'hemisphere' || type === 'hemispherelight') {
					const skyColor = item.skyColor === 0x000000 ? item.skyColor : item.skyColor || 0xffffff;
					const groundColor = item.groundColor === 0x000000 ? item.groundColor : item.groundColor || 0xffffff;
					const intensity = item.intensity === 0 ? item.intensity : item.intensity || 1;
					light = new HemisphereLight(skyColor, groundColor, intensity);
					if (item.position) {
						light.position.copy(item.position);
					}
				}
				this.allLights.push(light);
				this.scene.add(light);
			});
		},
		updateControls() {
			if (this.controlsOptions) {
				Object.assign(this.controls, this.controlsOptions);
			}
		},
		load() {
			if (!this.src) return;
			if (this.object) {
				this.wrapper.remove(this.object);
			}
			this.loader.load(
				this.src,
				(...args) => {
					const object = this.getObject(...args);
					if (this.process) {
						this.process(object);
					}
					this.addObject(object);
					this.$emit('on-load');
				},
				xhr => {
					this.$emit('on-progress', xhr);
				},
				err => {
					this.$emit('on-error', err);
				}
			);
		},
		getObject(object) {
			return object;
		},
		addObject(object) {
			//    const center = getCenter(object)
			// // this.planeModel.position.copy(this.myCenter.negate())
			//    this.wrapper.position.copy(center.negate())
			// let center2 = getCenter(this.wrapper)
			// let center3 = new Vector3(center2.x, center2.y + 30, center2.z)

			// this.planeModel.position.copy(center3.negate())
			// this.myCenter = center2.negate()
			this.object = object;
			this.wrapper.add(this.object);
			this.updateModel();
			this.updateCamera();
			this.firstCameraPosition = this.cameraPosition;
			// eslint-disable-next-line new-cap
			this.newCartoon = new cartoonUtil(this.object, this.mixer);
			this.newCartoon._disposeMod(-1);
			this.$emit('on-cartoon', this.newCartoon);
			// eslint-disable-next-line new-cap
			this.newModel = new addModel(this.object, this.camera, this.wrapper, this.initModel, this.nodeColor);
			this.mixer = new THREE.AnimationMixer(this.object);
			this.$emit('on-model', this.newModel);
		},
		// 修改选中模块颜色
		updateClickDomColor() {
			this.composer = new EffectComposer(this.renderer);
			let renderPass = new RenderPass(this.scene, this.camera);
			this.composer.addPass(renderPass);
			this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
			this.composer.addPass(this.outlinePass);
			let outlineParams = {
				renderToScreen: true,
				edgeStrength: 3, // 度 默认3
				edgeGlow: 1, // 度 默认1
				edgeThickness: 1.0, // 边缘浓度
				pulsePeriod: 0, // 闪烁频率 默认0 值越大频率越低
				usePatternTexture: false, // 使用纹理
				visibleEdgeColor: 0x00ffff, // 边缘可见部分发光颜色
				hiddenEdgeColor: 0x00ffff // 边缘遮挡部分发光颜色
			};
			this.outlinePass.renderToScreen = outlineParams.renderToScreen;
			this.outlinePass.edgeStrength = outlineParams.edgeStrength;
			this.outlinePass.edgeGlow = outlineParams.edgeGlow;
			this.outlinePass.edgeThickness = outlineParams.edgeThickness;
			this.outlinePass.visibleEdgeColor.set(outlineParams.visibleEdgeColor);
			this.outlinePass.hiddenEdgeColor.set(outlineParams.hiddenEdgeColor);
			this.outlinePass.usePatternTexture = outlineParams.usePatternTexture;
			let effectCopy = new ShaderPass(CopyShader);
			// CopyShader是为了能将结果输出，普通的通道一般都是不能输出的，要靠CopyShader进行输出
			effectCopy.renderToScreen = true; // 设置这个参数的目的是马上将当前的内容输出
			let bloomPass = new BloomPass(0, 50, 0, 256);
			this.composer.addPass(bloomPass); // 添加光效
			this.composer.addPass(effectCopy); // 输出到屏幕
			this.effectFXAA = new ShaderPass(FXAAShader);
			this.effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
			this.composer.addPass(this.effectFXAA);
		},
		/**
		 * 设置生成平面
		 */
		setNewPlane() {
			const geometry = new THREE.PlaneGeometry(3500, 3500, 20, 20);
			const material = new THREE.MeshBasicMaterial({
				color: 0x49a8d7,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.6,
				wireframe: true
			});
			geometry.name = 'planeModelgeometry';
			material.name = 'planeModelmaterial';
			this.planeModel = new THREE.Mesh(geometry, material);
			this.planeModel.rotation.set(-0.5 * Math.PI, 0, 0);
			this.planeModel.position.set(0, 0, 0);
			this.planeModel.name = 'planeModel';

			this.wrapper.add(this.planeModel);
		},
		changePlaneHeight() {
			this.planeModel.position.y = this.planeHei;
		},
		/**
		 * labelList: [{text: '',name: ''}]
		 */
		addLabels() {
			if (this.labelList.length == 0) {
				let removeList = [];
				this.object.traverse(child => {
					if (child.type=='Object3D') {
						removeList.push(child);
					}
				});
				this.object.remove(...removeList);
				return;
			}
			for (let i = 0; i < this.labelList.length; i++) {
				let tNum = parseFloat(this.labelList[i].num)
				let poName = this.object.children.find(a => {
					return a.name == this.labelList[i].name;
				})
				poName.material.dispose()
				// 根据风量设置颜色
				if (tNum > this.rwColorNums[0]) {
					const material = new THREE.MeshBasicMaterial( {color: this.rwColors[0]} );
					poName.material = material
				} else if (tNum > this.rwColorNums[1]) {
					const material = new THREE.MeshBasicMaterial( {color: this.rwColors[1]} );
					poName.material = material
				} else if (tNum > this.rwColorNums[2]) {
					const material = new THREE.MeshBasicMaterial( {color: this.rwColors[2]} );
					poName.material = material
				} else if (tNum > this.rwColorNums[3]) {
					const material = new THREE.MeshBasicMaterial( {color: this.rwColors[3]} );
					poName.material = material
				} else if (tNum > this.rwColorNums[4]) {
					const material = new THREE.MeshBasicMaterial( {color: this.rwColors[4]} );
					poName.material = material
				} else if (tNum > this.rwColorNums[5]) {
					const material = new THREE.MeshBasicMaterial( {color: this.rwColors[5]} );
					poName.material = material
				} else if (tNum == this.rwColorNums[5]) {
					const material = new THREE.MeshBasicMaterial( {color: this.rwColors[6]} );
					poName.material = material
				} else if (tNum < this.rwColorNums[5]) {
					const material = new THREE.MeshBasicMaterial( {color: this.rwColors[7]} );
					poName.material = material
				}
				let pos = new THREE.Vector3(poName.position.x, poName.position.y, poName.position.z);
				// pos.multiplyScalar(0.5)
				const div = document.createElement('div');
				div.className = 'label';
				div.textContent = this.labelList[i].text;
				// debugger
				const divLabel = new CSS2DObject(div);
				divLabel.position.set(pos.x, pos.y, pos.z);
				this.object.add(divLabel);
			}
		},
		// 是否显示风流
		windFlow() {
			if (this.isWind) {
				this.moveTextures = addAllWindDir(this.object);
			} else {
				for (let i = 0; i < this.moveTextures.length; i++) {
					let moveTexture = this.moveTextures[i];
					let obj = moveTexture.obj;
					this.object.remove(obj);
					obj.geometry.dispose();
					obj.material.dispose();
				}
				this.moveTextures = [];
			}
		},
		texturesUpdate(data) {
			if (data.counter < 1) {
				data.obj.position.copy(data.curve.getPointAt(data.counter));
				let tangent = data.curve.getTangentAt(data.counter).normalize();
				data.axis.crossVectors(data.up, tangent).normalize();
				let radians = Math.acos(data.up.dot(tangent));
				data.obj.quaternion.setFromAxisAngle(data.axis, radians);
				data.obj.rotateX(-Math.PI * 0.5);
				data.counter += data.speed;
			} else {
				data.counter = 0;
			}
		},
		animate() {
			this.controls.update();
			// this.transformControl.update()
			let time = clock.getDelta();
			if (this.mixer) {
				this.mixer.update(time);
			}
			for (let i = 0; i < this.moveTextures.length; i++) {
				let moveTexture = this.moveTextures[i];
				this.texturesUpdate(moveTexture);
			}
			this.render();
			this.reqId = requestAnimationFrame(this.animate);
		},
		render() {
			if (this.composer) {
				this.composer.render();
			}
			this.labelRenderer.render(this.scene, this.camera);
			this.renderer.render(this.scene, this.camera);
		},
		optBtn(name) {
			this.isRedact = false;
			this.isRemove = false;
			this.isWind = false;
			this.addDoor = false;
			this.addSensor = false;
			this.addWindow = false;
			this.isFlow = false;
			this.isTSControl = false;
			this[name] = true;
			// 关闭编辑
			this.startRedact = false
			this.newModel.clearCylinder()
			// 关闭移动
			this.transformControl.detach()
			this.transformControl.enabled = this.isTSControl
			if (this.isFlow) {
				this.addLabels()
			} else {
				let removeList = [];
				this.object.traverse(child => {
					if (child.type=='Object3D') {
						removeList.push(child);
					}
				});
				this.object.remove(...removeList);
				this.$emit('show-labels', true);
			}
		},
		setPM() {},
		confirmDelete () {
			let obj = this.selectedObjects[this.selectedObjects.length - 1]
			this.$emit('delete-model', obj.name)
			this.newModel.removeGeoModel(obj);
			this.selectedObjects = [];
			this.showDeleteDia = false
		},
		saveModel () {
			this.$emit('save-model')
			// const output = JSON.stringify( this.object.toJSON() );
			// saveString( output, 'scene.json' );
		}
	}
};
</script>
<style>
.label {
	margin-top: -1em;
	border: 1px;
	border-radius: 8px;
	width: 100px;
	text-align: center;
	cursor: pointer;
	color: rgb(0, 155, 234);
	line-height: 1.2;
	background-color: rgb(244, 244, 244);
	box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.25);
}

.label:hover {
	box-shadow: 0px 0px 20px rgba(0, 155, 234, 0.8);
}
.pmBtn {
	position: absolute;
	top: 55px;
	left: 5px;
	padding-left: 5px;
	width: 190px;
	height: 70px;
	text-align: center;
	font-size: 15px;
	line-height: 35px;
	border: 1px solid #46b2f7;
	color: #fff;
	cursor: pointer;
	background: radial-gradient(ellipse, #0c153a 60%, #0e5190);
}
.pmBtn input {
	width: 90px;
	border: 1px solid #46b2f7;
}
</style>
