<template>
  <div @click="send()">
    <p><b>{{percentage}} %</b></p>
    <svg v-if="true" width="200" height="200">
      <circle cx="100" cy="100" r="100" fill="grey" />
      <circle cx="100" cy="100" v-bind:r="percentage" fill="orange" />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'WebSocket',
  data() {
    return {
      percentage: '100',
      ws: null,
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
};
</script>

<style lang="scss" scoped>
</style>
