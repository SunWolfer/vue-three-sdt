<script>
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import mixin from './model-mixin.vue'
export default {
  name: 'model-gltf',
  mixins: [mixin],
  props: {
    lights: {
      type: Array,
      default () {
        return [
          {
            type: 'Hemispherelight',
            position: { x: 1, y: 1, z: 1 },
            skyColor: 0xffffff,
            groundColor: 0xffffff,
            intensity: 1
          }, {
            type: 'Ambientlight',
            color: 0xffffff,
            intensity: 1
          }
        ]
      }
    },
    gammaOutput: {
      type: Boolean,
      default: true
    }
  },
  data () {
    const loader = new GLTFLoader()
    loader.setCrossOrigin(this.crossOrigin)
    return {
      loader
    }
  },
  methods: {
    load () {
      if (!this.src) return
      if (this.object) {
        this.wrapper.remove(this.object)
      }
      this.loader.load(this.src, (data) => {
        this.addObject(data.scene)
        this.$emit('on-load', this.myCenter)
      }, (xhr) => {
        this.$emit('on-progress', xhr)
      }, (err) => {
        console.log(err)
        this.$emit('on-error', err)
      })
    }
  }
}
</script>
