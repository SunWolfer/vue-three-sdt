<template>
	<div class="externalArea">
		<div 
			v-for="(i, index) in btnsList"
			:key="index"
			@click="pitchBtn(i.operate, i.showDia)"
			:class="pitchName == i.operate ? i.className + 'Pitch' : i.className">
		</div>
		<div @click="saveModel" class="saveBtn"></div>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				btnsList: [{
					name: '新增',
					operate: 'isRedact',
					className: 'addBtn',
					showDia: false
				}, {
					name: '删除',
					operate: 'isRemove',
					className: 'deleteBtn',
					showDia: false
				}, {
					name: '风流',
					operate: 'isWind',
					className: 'windBtn',
					showDia: false
				}, {
					name: '风量',
					operate: 'isFlow',
					className: 'flowBtn',
					showDia: false
				}, {
					name: '风门',
					operate: 'addDoor',
					className: 'doorBtn',
					showDia: true
				}, {
					name: '风窗',
					operate: 'addWindow',
					className: 'windowBtn',
					showDia: true
				}, {
					name: '传感器',
					operate: 'addSensor',
					className: 'sensorBtn',
					showDia: true
				}, {
					name: '移动',
					operate: 'isTSControl',
					className: 'pointMove',
					showDia: false
				}],
				pitchName: ''
			}
		},
		methods: {
			pitchBtn (pitch, showDia) {
				if (this.pitchName == pitch) {
					this.pitchName = ''
				} else {
					this.pitchName = pitch
				}
				this.$emit('optBtn', this.pitchName, showDia)
			},
			saveModel () {
				this.$emit('save-model')
			}
		}
	}
</script>

<style scoped="scoped">
	/* 外部区域 */
	.externalArea {
		position: absolute;
		width: 100%;
		height: 45px;
		padding: 5px;
		top: 5px;
		z-index: 999;
	}
	/* 新增按钮 */
	.addBtn {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/normal/Button01.png);
		background-size: 100% 100%;
	}
	.addBtn:hover {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button01.png);
		background-size: 100% 100%;
	}
	/* 新增按钮选中 */
	.addBtnPitch {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button01.png);
		background-size: 100% 100%;
	}
	/* 删除按钮 */
	.deleteBtn {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/normal/Button02.png);
		background-size: 100% 100%;
	}
	.deleteBtn:hover {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button02.png);
		background-size: 100% 100%;
	}
	/* 删除按钮选中 */
	.deleteBtnPitch {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button02.png);
		background-size: 100% 100%;
	}
	/* 风流按钮 */
	.windBtn {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/normal/Button03.png);
		background-size: 100% 100%;
	}
	.windBtn:hover {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button03.png);
		background-size: 100% 100%;
	}
	/* 风流按钮选中 */
	.windBtnPitch {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button03.png);
		background-size: 100% 100%;
	}
	/* 风量 */
	.flowBtn {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/normal/Button04.png);
		background-size: 100% 100%;
	}
	.flowBtn:hover {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button04.png);
		background-size: 100% 100%;
	}
	/* 风量 */
	.flowBtnPitch {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button04.png);
		background-size: 100% 100%;
	}
	/* 风门按钮 */
	.doorBtn {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/normal/Button05.png);
		background-size: 100% 100%;
	}
	.doorBtn:hover {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button05.png);
		background-size: 100% 100%;
	}
	/* 风门按钮选中 */
	.doorBtnPitch {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button05.png);
		background-size: 100% 100%;
	}
	/* 风窗按钮 */
	.windowBtn {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/normal/Button06.png);
		background-size: 100% 100%;
	}
	.windowBtn:hover {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button06.png);
		background-size: 100% 100%;
	}
	/* 风窗按钮选中 */
	.windowBtnPitch {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button06.png);
		background-size: 100% 100%;
	}
	/* 传感器 */
	.sensorBtn {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/normal/Button07.png);
		background-size: 100% 100%;
	}
	.sensorBtn:hover {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button07.png);
		background-size: 100% 100%;
	}
	/* 传感器按钮选中 */
	.sensorBtnPitch {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/Button07.png);
		background-size: 100% 100%;
	}
	/* 移动节点 */
	.pointMove {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/normal/move-01.png);
		background-size: 100% 100%;
	}
	.pointMove:hover {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/move-02.png);
		background-size: 100% 100%;
	}
	.pointMovePitch {
		width: 91px;
		height: 35px;
		float: left;
		margin-right: 5px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/move-02.png);
		background-size: 100% 100%;
	}
	.saveBtn {
		width: 91px;
		height: 35px;
		float: right;
		margin-right: 20px;
		cursor: pointer;
		background-image: url(../../assets/buttons/normal/conserve-01.png);
		background-size: 100% 100%;
	}
	.saveBtn:hover {
		width: 91px;
		height: 35px;
		float: right;
		margin-right: 20px;
		cursor: pointer;
		background-image: url(../../assets/buttons/pick/conserve-02.png);
		background-size: 100% 100%;
	}
</style>
