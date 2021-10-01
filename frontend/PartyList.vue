<template>
  <div>
    <b>Party List</b><button @click="logout()">disband</button>
    <li v-for="user in users">{{user}}</li>
  </div>
</template>

<script>
export default {
  name: 'PartyList',
  props: {
    users: Array,
  },
  data() {
    return {
    };
  },
  methods: {
    async logout() {
      try {
        await fetch('/logout', {method: 'DELETE'});
        this.$emit('logout');
      } catch(err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
  b {
    margin-right: 5px;
  }
</style>
