<script>
import { ObjectLoader } from 'three';
import mixin from './model-mixin.vue';

export default {
  name: 'model-json',
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
  data() {
    const loader = new ObjectLoader();
    loader.setCrossOrigin(this.crossOrigin);

    return {
      loader,
    };
  }
};
</script>