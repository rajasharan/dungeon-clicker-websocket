<template>
  <div>
    <party-list class="party" v-if="show" v-bind:users="users" @logout="logout = true"></party-list>
    <div class="container">
      <web-socket
        v-if="show"
        @error="show = false"
        @users="users = $event"
        @close="logout = false"
        v-bind:logout="logout">
      </web-socket>
      <span v-else>
        <input type="text" v-model="me" v-bind:placeholder="error" v-on:keyup.enter="login()">
        <button @click="login()">Join Party</button>
      </span>
    </div>
  </div>
</template>

<script>
import WebSocket from './WebSocket.vue';
import PartyList from './PartyList.vue';

export default {
  name: 'App',
  components: { WebSocket, PartyList },
  data() {
    return {
      show: false,
      users: [],
      me: '',
      error: 'enter username',
    };
  },
  async created() {
    try {
      const res = await fetch('/me');
      const payload = await res.json();
      if (res.status < 400) {
        this.me = payload.me;
      } else {
        this.error = payload.err;
      }
    } catch (err) {
      console.log(err);
      this.error = `${err}`;
    }
  },
  methods: {
    async login() {
      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({me: this.me}),
        });
        if (res.status < 400) {
          this.show = true;
        } else {
          const payload = await res.json();
          this.error = payload.err;
          this.me = '';
        }
      } catch(err) {
        console.log(err);
        this.error = `${err}`;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  // color: green;
  // border: 3px solid green;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.party {
  position: absolute;
  left: 5%;
  top: 10%;
  cursor: pointer;
  user-select: none;
}

input {
  margin-right: 5px;
}
</style>
