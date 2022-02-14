import Vue from 'vue'
import * as THREE from 'three/build/three.module.js'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import pubCode from './pubCode.js'

import { Point }  from './vector.js'

import { addSkycheck, createUnitCylinder, findCenterPoint, creatBallsByPoint, removeSkycheck, findCenterByPoint, addMyModel } from './subVectors.js'

/**
 * 3D动画控制类
 */
export class cartoonUtil {
  constructor (object, mixer) {
    this.object = object
    this.mixer = mixer
    this.cartoonList = this._initList()
  }
  _initList () {
    let modList = []
		
		for (let i = 0; i < this.object.animations.length; i++) {
			let obj = this.object.animations[i]
			const animation = this.mixer.clipAction(obj) // 返回动画操作对象
			animation.timeScale = 2 // 设置动画播放速度
			modList.push({
			  name: obj.name,
			  value: animation
			})
		}
    return modList
  }

  /**
   * 播放动画
   * @param playName 下一个播放动画的名称
   * @param isOnce 是否单次播放
   * @private
   */
  _playCartoon (playName, isOnce) { // 播放动画
    if (!playName) {
      for (let argument of this.cartoonList) {
        argument.value.play()
        argument.value.paused = false
      }
    } else {
      for (let i = 0, len = this.cartoonList.length; i < len; i++) {
        if (this.cartoonList[i].name === playName) {
          if (isOnce) {
            this.cartoonList[i].value.setLoop(THREE.LoopOnce) // 不循环播放
            this.cartoonList[i].value.clampWhenFinished = true // 暂停在动画最后一帧
            this.cartoonList[i].value.enable = true
          }
          this.cartoonList[i].value.play()
          this.cartoonList[i].value.paused = false
          this._disposeMod(i)
        }
      }
    }
  }

  /**
   * 暂停动画
   * @param playName 暂停播放动画的名称
   * @private
   */
  _pausedCartoon (playName) { // 暂停动画
    for (let i = 0, len = this.cartoonList.length; i < len; i++) {
      if (this.cartoonList[i].name === playName) {
        this.cartoonList[i].value.paused = true
        this._disposeMod(i)
      }
    }
  }

  /**
   * 取消下标与入参不一致的动画
   * @param zindex
   * @private
   */
  _disposeMod (zindex) { // 取消动画
    for (let i = 0, len = this.cartoonList.length; i < len; i++) {
      if (i !== zindex) {
        this.cartoonList[i].value.stop()
      }
    }
  }

  /**
   * 设置动画播放速度
   * @param speed 速度 Integer
   * @private
   */
  _cartoonSpeed (speed) {
    for (let i = 0, len = this.cartoonList.length; i < len; i++) {
      this.cartoonList[i].value.timeScale = speed
    }
  }
  /**
   * 隐藏模型
   * @param {Object} name
   */
  _removeMassif (name) {
    this.object.traverse((obj) => {
      if (obj.name === name) {
        // obj.material.visible = false
        obj.visible = false
      }
    })
  }
  /**
   * 显示模型
   * @param {Object} name
   */
  _addMassif (name) {
    this.object.traverse((obj) => {
      if (obj.name === name) {
        // obj.material.visible = true
        obj.visible = true
      }
    })
  }
}

/**
 * 添加模型类
 */
export class addModel {
  constructor (object, camera, wrapper, initModel, nodeColor) {
	
    this.object = object
    this.camera = camera
		this.wrapper = wrapper
		this.cylinder = initModel
		// 节点颜色
		this.nodeColor = nodeColor
		this.startPoint = new THREE.Vector3(0, 0, 0)
		// 起始绘制点
		this.startDrawPoint = null
		// 起始绘制模型
		this.startDrawModel = []
		// 终止绘制模型
		this.endDrawModel = []
		
		// 柱体模型
		this.material = new THREE.MeshLambertMaterial({
			color: 0x2EBC4D
		})
		
		this.initGLB()
  }
  /**
   * 控制某模型隐藏显示
   * @param isshow 是否显示
   * @param name 隐藏显示模型名称
   */
  hideOrShowObj (isshow, name) {
    this.object.traverse((obj) => {
      if (obj.name === name) {
        for (let i = 0; i < obj.children.length; i++) {
          obj.children[i].material.visible = isshow
        }
      }
    })
  }
  changeColor (selectedObjects) {
    this.outlinePass.selectedObjects = selectedObjects
  }
  /**
   * 删除某个对象
   * @param {Object} obj
   */
  deletePicSprite (obj) {
		this.object.remove(obj)
		obj.geometry.dispose()
		obj.material.dispose()
  }
	
	getMousePositon (e, tz) {
		let mouse = null
		mouse.x = (e.clientX / window.innerWidth) * 2 - 1
		mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
		let vector = new THREE.Vector3(mouse.x, mouse.y, tz).unproject(this.camera)
		return vector
	}
	/**
	 * 生成球模型
	 * @param {Object} position
	 */
	addNewBall (position) {
		const geometry = new THREE.SphereGeometry(4, 30, 40)
		const material = new THREE.MeshBasicMaterial( {color: 0x0000FF} );
		this.cylinder = new THREE.Mesh( geometry, material )
		this.cylinder.position.set(position.x, position.y, position.z)
		this.object.add(this.cylinder)
	}
	/**
	 * 生成初始圆柱
	 * @param {Object} position 生成位置
	 */
	addNewCylinder (position, obj) {
		if (!obj) return
		let po = position
		// 判断是否是平面
		if (obj.name !== 'planeModel') {
			// 起始绘制模型
			this.startDrawModel = obj.name.split('-')
		}
		this.pubANC(po)
	}
	pubANC (positon) {
		this.cylinder = createUnitCylinder(positon)
		this.cylinder.name = 'textcylinder'
		this.startPoint = new THREE.Vector3(positon.x, positon.y, positon.z)
		this.object.add(this.cylinder)
	}
	calModelCenter (position, obj) {
	}
	/**
	 * 旋转模型
	 * @param {Object} v 目标点
	 * @param {Object} model 模型
	 */
	oriPoint (v, model) {
		let apos = new THREE.Vector3(v.x, v.y, v.z)
		let toRod = this.setModelSpin(model, apos)
		model.quaternion.set(toRod.x, toRod.y, toRod.z, toRod.w)
	}
	/**
	 * 计算四元值
	 * @param {Object} model 模型对象
	 * @param {Object} lookPoint 目标点
	 */
	setModelSpin (model, lookPoint) {
		//以下代码在多段路径时可重复执行
		let mtx = new THREE.Matrix4()  //创建一个4维矩阵
		mtx.lookAt(lookPoint, model.position , model.up) //设置朝向
		let toRot = new THREE.Quaternion()
		toRot.setFromRotationMatrix(mtx)  //计算出需要进行旋转的四元数值
		return toRot
	}
	/**
	 * 鼠标移动设置圆柱体模型长度和朝向
	 * @param {Object} event
	 */
	mouseMoveCylinder (p2) {
		let p1 = this.startPoint
		let len = new Point(p1.x, p1.y, p1.z).distance(new Point(p2.x, p2.y, p2.z))

		this.cylinder.scale.set(1, 1, len)
		this.cylinder.position.set(p1.x + (p2.x - p1.x) / 2, p1.y + (p2.y - p1.y) / 2, p1.z + (p2.z - p1.z) / 2)
		this.oriPoint(p2, this.cylinder)
	}
	/**
	 * 结束绘制
	 */
	drawEnd (position, obj) {
		if (!obj) return
		let po = position
		// 判断是否是平面
		if (obj.name !== 'planeModel') {
			// 结束绘制模型
			this.endDrawModel = obj.name.split('-')
		}
		let lens = this.startDrawModel.length
		let lene = this.endDrawModel.length
		// 生成模型名称
		let name = ''
		// 生成节点
		let nodeArray = [null, null]
		// 生成巷道数组
		let genModelList = []
		// 被拆分的巷道
		let splitModelList = []
		// 生成2节点
		// 连接两巷道
		if (lens !== 1 && lene !== 1) {
			name = `${this.startDrawPoint + ''}-${this.startDrawPoint + 1 + ''}`
			nodeArray = [{
				name: this.startDrawPoint + '',
				position: this.startPoint
			}, {
				name: this.startDrawPoint + 1 + '',
				position: po,
				connectPoint: name
			}]
			this.startDrawPoint = this.startDrawPoint + 2
		}
		// 生成1节点
		if ((lens == 1 && lene == 0) || (lens == 1 && lene == 2)) {
			name = `${this.startDrawModel[0]}-${this.startDrawPoint + ''}`
			nodeArray = [null, {
				name: this.startDrawPoint + '',
				position: po
			}]
			this.startDrawPoint = this.startDrawPoint + 1
		} else if ((lens == 0 && lene == 1) || (lens == 2 && lene == 1)) {
			name = `${this.startDrawPoint + ''}-${this.endDrawModel[0]}`
			nodeArray = [{
				name: this.startDrawPoint + '',
				position: this.startPoint
			}, null]
			this.startDrawPoint = this.startDrawPoint + 1
		}
		// 生成0节点
		if (lens == 1 && lene == 1) {
			name = `${this.startDrawModel[0]}-${this.endDrawModel[0]}`
		}
		// 生成球
		for (let i = 0; i < nodeArray.length; i++) {
			let a = nodeArray[i]
			if (a) {
				creatBallsByPoint(a.position, a.name, this.object, this.nodeColor)
			}
		}
		genModelList.push(name)
		// 如果起点处拆分
		if (lens == 2) {
			genModelList.push(`${this.startDrawModel[0]}-${nodeArray[0].name}`)
			genModelList.push(`${nodeArray[0].name}-${this.startDrawModel[1]}`)
			splitModelList.push(`${this.startDrawModel[0]}-${this.startDrawModel[1]}`)
		}
		// 如果结尾处拆分
		if (lene == 2) {
			genModelList.push(`${this.endDrawModel[0]}-${nodeArray[1].name}`)
			genModelList.push(`${nodeArray[1].name}-${this.endDrawModel[1]}`)
			splitModelList.push(`${this.endDrawModel[0]}-${this.endDrawModel[1]}`)
		}
		this.deletePicSprite(this.cylinder)
		removeSkycheck(this.object, splitModelList)
		Vue.nextTick(() => {
			this.connectBall(genModelList)
		})
		this.cylinder = null
		this.startPoint = new THREE.Vector3(0, 0, 0)
		// 起始绘制模型
		this.startDrawModel = []
		// 终止绘制模型
		this.endDrawModel = []
		return [genModelList, splitModelList]
	}
	// 删除初始巷道
	clearCylinder () {
		if (this.cylinder) {
			this.deletePicSprite(this.cylinder)
			Vue.nextTick(() => {
				this.cylinder = null
				this.startPoint = new THREE.Vector3(0, 0, 0)
				// 起始绘制模型
				this.startDrawModel = []
				// 终止绘制模型
				this.endDrawModel = []
			})
		}
	}
	// 按名称删除巷道
	removeModelByNames (name) {
		removeSkycheck(this.object, [name])
	}
	/**
	 * 连接球
	 * @param {Object} names
	 */
	connectBall (names, material) {
		let sumPoint = []
		for (let i = 0; i < names.length; i++) {
			let conts = names[i].split('-')
			let points = []
			points = this.object.children.filter(obj => {
				return obj.isMesh && (obj.name === conts[0] || obj.name === conts[1])
			})
			sumPoint.push(points)
		}
		for (let i = 0; i < sumPoint.length; i++) {
			this.object = addSkycheck(sumPoint[i][0].position, sumPoint[i][1].position, this.object, names[i], material ? material : this.material)
		}
	}
	removeGeoModel (removeObj) {
		// 查询与选中模型连接的球
		let names = removeObj.name.split('-')
		// 一球
		let firstPoint = null
		// 二球
		let secondPoint = null
		// 与球连接的巷道条数
		let leftPoint = []
		let rightPoint = []
		// 判断是否是巷道
		if (names.length > 1) {
			this.object.traverse((child) => {
				if (child.isMesh) {
					if (child.name == `${names[0] + ''}`) {
						firstPoint = child
					}
					if (child.name == `${names[1] + ''}`) {
						secondPoint = child
					}
					if ((child.name.indexOf(`-${names[0] + ''}`) !== -1) || (child.name.indexOf(`${names[0] + ''}-`) !== -1)) {
						leftPoint.push(child)
					}
					if ((child.name.indexOf(`-${names[1] + ''}`) !== -1) || (child.name.indexOf(`${names[1] + ''}-`) !== -1)) {
						rightPoint.push(child)
					}
				}
			})
			// 移除选中模型
			this.deletePicSprite(removeObj)
		} else {
			// 是否删除
			let tt = this.object.children.find(child => {
				return child.isMesh && ((child.name.indexOf(`-${removeObj.name + ''}`) != -1) || (child.name.indexOf(`${removeObj.name + ''}-`) != -1))
			})
			if (!tt) {
				// 移除选中模型
				this.deletePicSprite(removeObj)
			}
		}
		if (firstPoint && leftPoint && leftPoint.length < 2) {
			this.deletePicSprite(firstPoint)
		}
		if (secondPoint && rightPoint && rightPoint.length < 2) {
			this.deletePicSprite(secondPoint)
		}
	}
	/**
	 * 初始化模型数据
	 */
	initGLB () {
		let pcolor = this.nodeColor
		// 节点球体
		let ballNode = []
		// 巷道信息
		let roadWayList = []
		// 不规则几何体
		let anoGeometryList = []
		this.object.traverse((child) => {
		  if (child.isMesh) {
				// 获取小球
				if (child.material.color && child.material.color.getHexString() == pcolor) {
					ballNode.push({
						name: child.name,
						position: child.position
					})
				}
		  }
		})
		let maxnum = ballNode.filter(i => {
			if (!isNaN(parseInt(i.name))) {
				return i
			}
		}).map(i => {
			return parseInt(i.name)
		})
		this.startDrawPoint = Math.max(...maxnum) + 1
	}
	/**
	 * 添加风门风窗传感器模型
	 * @param {Object} position 点击位置
	 * @param {Object} obj 点击模型
	 * @param {Object} type 模型类型
	 */
	addSmallModel (position, obj, type) {
		let po = findCenterByPoint(position, obj, this.object)
		addMyModel(po, obj, type, this.object)
	}
}
