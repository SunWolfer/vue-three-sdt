<template>
	<div class="three-box__wrapper">
		<div class="three-box confirmForm">
			<div class="three-box__header">
				<div class="three-box__title">
					<span>提示</span>
				</div>
				<button type="button" aria-label="Close" class="three-box__headerbtn" @click="closeDia">
					<i class="three-box__close">X</i>
				</button>
			</div>
			<!-- 内容 -->
			<div class="three-box__content">
				<p>确定进行[删除]操作?</p>
			</div>
			<!-- 底部 -->
			<div class="three-box__btns">
				<button type="button" class="offBtn" @click="closeDia">
					<span> 取消 </span>
				</button>
				<button type="button" class="general" @click="makeDia">
					<span> 确定 </span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		methods: {
			closeDia () {
				this.$emit('close')
			},
			makeDia () {
				this.$emit('confirm')
			}
		}
	}
</script>

<style>
	.three-box__wrapper {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		text-align: center;
		z-index: 2000;
		background-color: rgba(0,0,0,0.2);
	}
	.three-box__wrapper::after {
	    content: "";
	    display: inline-block;
	    height: 100%;
	    width: 0;
	    vertical-align: middle;
	}
	.three-box.confirmForm {
		background: linear-gradient(to left, #4CD7FF, #4CD7FF) left top no-repeat, 
		linear-gradient(to bottom, #4CD7FF, #4CD7FF) left top no-repeat, 
		linear-gradient(to left, #4CD7FF, #4CD7FF) right top no-repeat, 
		linear-gradient(to bottom, #4CD7FF, #4CD7FF) right top no-repeat, 
		linear-gradient(to left, #4CD7FF, #4CD7FF) left bottom no-repeat, 
		linear-gradient(to bottom, #4CD7FF, #4CD7FF) left bottom no-repeat, 
		linear-gradient(to left, #4CD7FF, #4CD7FF) right bottom no-repeat, 
		linear-gradient(to left, #4CD7FF, #4CD7FF) right bottom no-repeat;
		background-size: 1px 14px, 14px 1px, 1px 14px, 14px 1px;
		border-radius: 4px;
		background-color: #0D3773;
		padding: 5px;
		border: none;
	}
	.three-box {
	    display: inline-block;
	    width: 420px;
	    padding-bottom: 10px;
	    vertical-align: middle;
	    background-color: #FFF;
	    border-radius: 4px;
	    border: 1px solid #EBEEF5;
	    font-size: 18px;
	    -webkit-box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
	    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
	    text-align: left;
	    overflow: hidden;
	    -webkit-backface-visibility: hidden;
	    backface-visibility: hidden;
	}
	.three-box.confirmForm .three-box__header {
	    background-color: #0452A4;
	    color: #FFFFFF;
	    height: 24px;
	    padding: 5px 10px 5px 10px;
	    line-height: 24px;
			position: relative;
	}
	.three-box__title {
	    padding-left: 0;
	    margin-bottom: 0;
	    font-size: 18px;
	    line-height: 24px;
	    color: #FFFFFF;
	}
	.three-box__headerbtn {
	    position: absolute;
	    top: 8px;
	    right: 15px;
	    padding: 0;
	    border: none;
	    outline: 0;
	    background: 0 0;
	    font-size: 16px;
	    cursor: pointer;
	}
	.three-box.confirmForm .three-box__header .three-box__headerbtn .three-box__close {
	    color: #85ABD3;
	    border: 1px solid #85ABD3;
	}
	
	/* 内容 */
	.three-box__content {
		position: relative;
	    background-color: #0D3773;
	    color: #fff;
	    min-height: 40px;
	    padding: 15px 20px 0px 20px;
	    line-height: 20px;
	    font-size: 14px;
	}
	
	/* 底部 */
	.three-box__btns {
		text-align: center;
		padding: 5px 15px 0;
	}
	
	.offBtn {
		background: -webkit-gradient(linear, left bottom, left top, from(#0152A4), to(#268BFF));
		background: linear-gradient(0deg, #0152A4, #268BFF);
		color: #fff;
		border: none;
		margin-left: 0px;
		padding: 9px 15px;
		font-size: 12px;
		border-radius: 3px;
		
		display: inline-block;
		line-height: 1;
		white-space: nowrap;
		cursor: pointer;
		-webkit-appearance: none;
		text-align: center;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		outline: 0;
		-webkit-transition: .1s;
		transition: .1s;
		font-weight: 500;
	}
	.offBtn:hover {
		background: -webkit-gradient(linear, left bottom, left top, from(#268BFF), to(#0152A4));
		background: linear-gradient(0deg, #268BFF, #0152A4);
	}
	.general {
		margin-left: 10px;
		color: #000000;
		background: -webkit-gradient(linear, left bottom, left top, from(#80BF10), to(#ACFF00));
		background: linear-gradient(0deg, #80BF10, #ACFF00);
		border: none;
		
		border: none;
		padding: 9px 15px;
		font-size: 12px;
		border-radius: 3px;
		display: inline-block;
		line-height: 1;
		white-space: nowrap;
		cursor: pointer;
		-webkit-appearance: none;
		text-align: center;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		outline: 0;
		-webkit-transition: .1s;
		transition: .1s;
		font-weight: 500;
		
	}
	.general:hover {
		background: -webkit-gradient(linear, left bottom, left top, from(#ACFF00), to(#80BF10));
		background: linear-gradient(0deg, #ACFF00, #80BF10);
	}
</style>
