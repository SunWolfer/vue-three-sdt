export let Point = function(x, y, z) {
	this.x = Number(x.toFixed(2)) || 0
	this.y = Number(y.toFixed(2)) || 0
	this.z = Number(z.toFixed(2)) || 0
}

Point.prototype = {
	/*~!Vector*/
	toArray: function() {
		return [this.x, this.y, this.z]
	},
	//加
	add: function(v) {
		return new Point(this.x + v.x, this.y + v.y, this.z + v.z)
	},
	//减
	sub: function(v) {
		return new Point(this.x - v.x, this.y - v.y, this.z - v.z)
	},
	//平方根
	getMod: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y, this.z * this.z)
	},
	//乘 除
	mulNum: function(num) {
		return new Point(this.x * num, this.y * num, this.z * num)
	},
	//负向量
	getNegative: function() {
		return new Point(-this.x, -this.y, -this.z)
	},
	//点积
	dotMul: function(v) {
		return this.x * v.x + this.y * v.y + this.z * v.z
	},
	/**
	 *获取夹角,注意返回的是角度
	 */
	getAngle: function(v) {
		return Math.acos(this.dotMul(v) / (this.getMod() * v.getMod())) * 180 / Math.PI
	},
	/**
	 *获取夹角,返回的是弧度
	 */
	getRadian: function(v) {
		let m1 = this.getMod(),
			m2 = v.getMod()
		if (m1 == 0 || m2 == 0) {
			return 0
		}
		return Math.acos(this.dotMul(v) / (m1 * m2))
	},
	distance: function(v) {
		return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y) + (this.z - v.z) * (this.z - v.z))
	},
	distance2: function(v) {
		return (this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y) + (this.z - v.z) * (this.z - v.z)
	},
	/**
	 * 取单位向量
	 */
	getUnitv: function(v) {
		return this.mulNum(1 / this.distance(v))
	}
	/*END~!Vector*/
}
