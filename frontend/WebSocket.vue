<template>
  <div @click="send()">
    <p><b>{{percentage}} %</b></p>
    <svg v-if="true" width="200" height="200">
      <circle cx="100" cy="100" r="100" v-bind:fill="bgColor" />
      <path v-if="x1" v-bind:d="fill" fill="orange" />
    </svg>
  </div>
</template>

<script>
import svgIntersections from 'svg-intersections';
const intersect = svgIntersections.intersect;
const shape = svgIntersections.shape;

export default {
  name: 'WebSocket',
  props: {
    logout: Boolean,
  },
  data() {
    return {
      percentage: '0',
      ws: null,
      x1: '',
      y1: '',
      x2: '',
      y2: '',
      flip: 1,
    };
  },
  async created() {
    try {
      console.log(process.env.WS_URL);
      const ws = new WebSocket(process.env.WS_URL);
      ws.onerror = () => {
        console.log('ws connection error');
        this.$emit('error');
        this.ws = null;
      };
      ws.onopen = () => {
        console.log('ws connection open');
        this.ws = ws;
      };
      ws.onclose = () => {
        console.log('ws connection close');
        this.$emit('error');
        this.ws = null;
      };
      ws.onmessage = (msg) => {
        try {
          const payload = JSON.parse(msg.data);
          if (payload.percentage) {
            this.percentage = payload.percentage;
          }
          if (payload.users) {
            this.$emit('users', payload.users);
          }
        } catch(err) {
          console.log(err);
        }
      };
    } catch(err) {
      console.log(err);
    }
  },
  beforeDestroy() {
  },
  methods: {
    send() {
      if (this.ws) {
        this.ws.send(JSON.stringify({cmd: '-10'}));
      }
    },
  },
  watch: {
    percentage(val) {
      if (Number(val) <= 0) {
        this.x1 = '';
        return;
      } 
      const y = (100 - Number(val)) * 2;
      this.flip = y <= 100 ? 1 : 0;

      const intersections = intersect(
        shape("circle", { cx: 100, cy: 100, r: 100 }),
        shape("line", { x1: 0, y1: y, x2: 200, y2: y })
      );

      if (intersections.points.length > 1) {
        this.x1 = intersections.points[0].x.toFixed(3);
        this.y1 = intersections.points[0].y.toFixed(3);
        this.x2 = intersections.points[1].x.toFixed(3);
        this.y2 = intersections.points[1].y.toFixed(3);
      }
    },
    logout(val) {
      if (val && this.ws) {
        this.ws.close();
        this.$emit('close');
      }
    }
  },
  computed: {
    fill() {
      return `M${this.x1} ${this.y1}, A100 100, 0 ${this.flip} 0, ${this.x2} ${this.y2}`;
    },
    bgColor() {
      const val = Number(this.percentage);
      if (val === 100) return 'orange';
      if (val === 0) return 'grey';
      else return 'lightgrey';
    }
  },
};
</script>

<style lang="scss" scoped>
  p {
    color: red;
  }
</style>
