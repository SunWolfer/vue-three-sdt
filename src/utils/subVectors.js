import * as THREE from 'three/build/three.module.js'
import { Point }  from './vector.js'
import { ObjectLoader } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

// 静态模型
import { windModel , doorModel, windowModel, sensorModel} from './staticModel.js'

/**
 * 添加圆柱体
 * @param {Object} start 开始点
 * @param {Object} end 结束点
 * @param {Object} scene 
 */
export function addSkycheck(start, end, scene, name, material) {
	let cylinder = createCylinderByTwoPoints(start, end, name, material)
	scene.add(cylinder)

	// //画一条直线方便观察
	// let geometry3 = new THREE.BufferGeometry()
	// geometry3.setFromPoints([start, end])
	// let line = new THREE.Line(
	// 	geometry3,
	// 	new THREE.LineBasicMaterial({
	// 		color: "red",
	// 	}),
	// 	THREE.LineSegments
	// )
	// line.formPoint = [{
	// 	x: start.x,
	// 	y: start.y,
	// 	z: start.z,
	// 	name: name.split('-')[0]
	// }, {
	// 	x: end.x,
	// 	y: end.y,
	// 	z: end.z,
	// 	name: name.split('-')[1]
	// }]
	// line.name = name + 'line'
	// scene.add(line)
	return scene
}

// 根据两点画圆柱
export function createCylinderByTwoPoints(pointX, pointY, name, material) {
	let direction = new THREE.Vector3().subVectors(pointY, pointX);
	let orientation = new THREE.Matrix4();
	orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
	orientation.multiply(
		new THREE.Matrix4().set(
			1, 0, 0, 0,
			0, 0, 1, 0,
			0, -1, 0, 0,
			0, 0, 0, 1
		)
	);
	let edgeGeometry = new THREE.CylinderGeometry(
		2.5, 2.5, direction.length(), 4
	);
	let edge = new THREE.Mesh(edgeGeometry, material);
	edge.name = name ? name : 'textcylinder'
	edge.applyMatrix4(orientation)
	//两个点的中心点 position based on midpoints - there may be a better solution than this
	edge.position.x = (pointY.x + pointX.x) / 2;
	edge.position.y = (pointY.y + pointX.y) / 2;
	edge.position.z = (pointY.z + pointX.z) / 2;
	return edge;
}

/**
 * 生成1长度圆柱体
 * @param {Object} position
 */
export function createUnitCylinder(position) {
	let geometry = new THREE.CylinderGeometry( 2.5, 2.5,1, 4 );
	geometry.rotateX( Math.PI * 0.5 )
	let material = new THREE.MeshBasicMaterial( {color: 0x2EBC4D} )
	let cylinder = new THREE.Mesh( geometry, material )
	cylinder.position.set(position.x, position.y, position.z)
	return cylinder
}
/**
 * 创建临时平面找中心点
 * @param {Object} position
 * @param {Object} obj
 * @param {Object} sence
 */
export function findCenterPoint (position, obj, sence) {
	// 找中心线
	let points = []
	sence.traverse((child) => {
	  if (child.isLine && child.name == obj.name + 'line') {
			points = child.formPoint
	  }
	})
	
	// 创建平面
	const geometry = new THREE.PlaneGeometry( 10, 10 );
	const material = new THREE.MeshBasicMaterial({
		color: 0xffff00, 
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0,
	})
	const plane = new THREE.Mesh( geometry, material )
	plane.rotation.set(obj.rotation.x , obj.rotation.y - 0.5 * Math.PI, obj.rotation.z)
	sence.add(plane)
	plane.position.set(position.x, position.y, position.z)
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// 计算长度
			let dx = Math.abs(points[0].x - points[1].x)
			let dy = Math.abs(points[0].y - points[1].y)
			let dz = Math.abs(points[0].z - points[1].z)
			let width = Math.sqrt(
				Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2)
			)
			
			// 创建起始点和终止点
			const vectorStr = new THREE.Vector3(points[0].x, points[0].y, points[0].z)
			const vectorEnd = new THREE.Vector3(points[1].x, points[1].y, points[1].z)
			const ray = new THREE.Raycaster(vectorStr, vectorEnd.sub(vectorStr).normalize(), 0, width)
			const intersects = ray.intersectObject(plane)
			sence.remove(plane)
			resolve(intersects)
		}, 0)
	})
}

/**根据三点确定中心点
 * @param {Object} position 点击位置
 * @param {Object} obj 点击模型
 * @param {Object} sence 模型object
 */
export function findCenterByPoint (position, obj, sence) {
	let pointsName = obj.name.split('-')
	let points = []
	sence.traverse((child) => {
	  if (child.isMesh && ((child.name == pointsName[0]) || (child.name == pointsName[1]))) {
			points.push(child.position)
	  }
	})
	let target = new THREE.Vector3()
	let clickPoint = new THREE.Vector3(position.x, position.y, position.z)
	let line = new THREE.Line3(points[0], points[1])
	line.closestPointToPoint(clickPoint, true, target)
	return target
}

/**
 * 根据坐标生成球
 * @param {Object} position
 * @param {Object} name
 * @param {Object} sence
 */
export function creatBallsByPoint (position, name, sence, pColor) {
	const geometry = new THREE.SphereGeometry(4, 30, 40)
	const material = new THREE.MeshBasicMaterial( {color: `#${pColor}`} );
	let ball = new THREE.Mesh( geometry, material )
	ball.position.set(position.x, position.y, position.z)
	ball.name = name
	sence.add(ball)
}

/**
 * 删除巷道及辅助线
 * @param {Object} sence
 * @param {Object} names
 */
export function removeSkycheck(sence, names) {
	// 待删除数组
	let removeList = []
	for (let i = 0; i < names.length; i++) {
		let cylinderName = names[i]
		// let lineName = names[i] + 'line'
		sence.traverse((obj) => {
      if (obj.isMesh && obj.name === cylinderName) {
				removeList.push(obj)
      }
			// if (obj.isLine && obj.name === lineName) {
			// 	removeList.push(obj)
			// }
    })
	}
	for (let i = 0; i < removeList.length; i++) {
		sence.remove(removeList[i])
		removeList[i].geometry.dispose()
		removeList[i].material.dispose()
	}
}
/**
 * 添加风流(管道法)
 * @param {Object} object 总体对象
 * @param {Object} objname 巷道名称
 */
export function addWindDir (object, obj) {
	let curveArr  = []
	let CurvePath = new THREE.CurvePath()
	let objname = obj.name
	let names = objname.split('-')
	// 取直线连接点
	for (let i = 0; i < names.length; i++) {
		let sObj = null
		object.traverse((child) => {
			if (child.isMesh && names[i] == child.name) {
				sObj = child
			}
		})
		curveArr.push(new THREE.Vector3(sObj.position.x, sObj.position.y, sObj.position.z))
	}
	// 按点生成线
	for (let i = 0; i < curveArr.length - 1; i++) {
		let line = new THREE.LineCurve3(curveArr[i], curveArr[i + 1])
		CurvePath.curves.push(line)
	}
	let tubeGeometry = new THREE.TubeGeometry(CurvePath, 128, 2, 4, false)
	let textureLoader = new THREE.TextureLoader()
	let texture = textureLoader.load(`http://192.168.124.83:8000/startfile/textModel/jiantou.png`)
	// 设置阵列模式 RepeatWrapping
	texture.wrapS = THREE.RepeatWrapping
	texture.wrapT = THREE.RepeatWrapping
	// 设置x方向的重复数(沿着管道路径方向)
	// 设置y方向的重复数(环绕管道方向)
	texture.repeat.x = 15
	texture.repeat.y = 4
	// 设置管道纹理偏移数,便于对中
	texture.offset.y = 0.5;
	let tubeMaterial = new THREE.MeshPhongMaterial({
		map: texture,
		transparent: true,
		depthWrite: false,
		opacity: 1
	})
	//修改一下模型的材质
	obj.material.depthWrite = false
	let tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
	object.add(tube)
	let textureObj = {name:objname,obj:tube,direction:true,curveArr:curveArr}
	let moveTextures = []
	moveTextures.push(textureObj)
	return moveTextures
}

/**
 * 显示所有巷道上的风流
 * @param {Object} object
 */
export function addAllWindDir (object) {
	object.traverse((child) => {
		if (child.isMesh) {
			child.material.depthWrite = false
		}
	})
	let roadList = object.children.filter(i => {
		return i.isMesh && i.name.split('-').length > 1 && i.name.split('-')[0] !== 'door' && i.name.split('-')[0] !== 'window' && i.name.split('-')[0] !== 'sensor'
	})
	let moveTextures = []
	for (let i = 0; i < roadList.length; i++) {
		// moveTextures.push(...addWindDir(object, roadList[i]))
		let abs = addWindDirByCurve(object, roadList[i])
		let obj = getArrows(roadList[i].position, object)
		moveTextures.push({
			obj: obj,
			curve: abs,
			counter: 0,
			speed: Math.random() * 0.1,
			up: new THREE.Vector3(0, 1, 0),
			axis: new THREE.Vector3()
		})
	}
	return moveTextures
}

function getArrows (position, object) {
	let loader = new ObjectLoader()
	let myWind = loader.parse(windModel)
	let arrowHelper = myWind.clone()
	arrowHelper.name = 'wind' + Math.random()
	arrowHelper.position.set(position.x, position.y, position.z)
	object.add(arrowHelper)
	return arrowHelper
}

export function addWindDirByCurve (object, obj) {
	let curveArr  = []
	let objname = obj.name
	let names = objname.split('-')
	let len = 0
	// 取直线连接点
	for (let i = 0; i < names.length; i++) {
		let sObj = null
		object.traverse((child) => {
			if (child.isMesh && names[i] == child.name) {
				sObj = child
			}
		})
		curveArr.push(new THREE.Vector3(sObj.position.x, sObj.position.y, sObj.position.z))
	}
	
	// const edges = new THREE.EdgesGeometry( obj.geometry )
	// const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) )
	// line.position.set(obj.position.x, obj.position.y, obj.position.z)
	// line.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z)
	// object.add(line)
	
	// for (let i = 0; i < curveArr.length - 1; i++) {
	// 	len += new Point(curveArr[i].x, curveArr[i].y, curveArr[i].z).distance(new Point(curveArr[i + 1].x, curveArr[i + 1].y, curveArr[i + 1].z))
	// }
	
	// 通过类CatmullRomCurve3创建一个3D样条曲线
	let curve = new THREE.CatmullRomCurve3(curveArr, false, 'catmullrom', 0)
	return curve
}


/**
 * 改变风流方向
 * @param {Object} edge
 * @param {Object} moveTextures
 */
export function changeWindDire (edge, moveTextures) {
	let name = edge.name
	for(let i=0;i<moveTextures.length;i++){
	let moveTexture = moveTextures[i]
	let nameFor = moveTexture.name
	if (nameFor === name) {
		// debugger
		let obj = moveTexture.obj
		let curveArr = moveTexture.curveArr
		let direction = moveTexture.direction
		let curveArrNew = []
		if(direction){
			curveArrNew =  curveArr.slice().reverse()
			moveTexture.direction = false
		} else {
			curveArrNew = curveArr
			moveTexture.direction = true
		}
		let curve = new THREE.CatmullRomCurve3(curveArrNew);
		let tubeGeometry = new THREE.TubeGeometry(curve, 100, 1.5, 50, false);
		obj.geometry = tubeGeometry
		}
	}
}

/**
 * 添加模型
 * @param {Object} position
 * @param {Object} object
 * @param {Object} type
 */
export function addMyModel (position, object, type, sence) {
	
	let loader = new ObjectLoader()
	let myModel = type == '1' ? doorModel : (type == '2' ? windowModel: sensorModel)
	let randomName = type == '1' ? 'door-' : (type == '2' ? 'window-': 'sensor-')
	
	let myWind = loader.parse(myModel)
	let arrowHelper = myWind.clone()
	arrowHelper.name = randomName + Math.random()

	let pointsName = object.name.split('-')
	let points = []
	sence.traverse((child) => {
	  if (child.isMesh && ((child.name == pointsName[0]) || (child.name == pointsName[1]))) {
			points.push(child.position)
	  }
	})
	
	let start = points[0]
	let end = points[1]
	let axis = new THREE.Vector3()
	let dir = new THREE.Vector3()
	
	dir.subVectors(start, end)
	let up = new THREE.Vector3(0, 1, 0)
	// let up = object.up
	arrowHelper.position.set(position.x, position.y, position.z)
	// arrowHelper.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z)
	let tangent = dir.clone().normalize()
	axis.crossVectors(up, tangent).normalize()
	let radians = Math.acos(up.dot(tangent))
	arrowHelper.quaternion.setFromAxisAngle(axis, radians)
	// // arrowHelper.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), Math.PI)
	// arrowHelper.rotateZ(-Math.PI)
	sence.add(arrowHelper)
}

// 保存文件
export function saveArrayBuffer ( buffer, filename) {
	save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}

export function saveString (text, filename) {
	save( new Blob( [ text ], { type: 'text/plain' } ), filename );
}

function save ( blob, filename ) {
	const link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594
	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
}