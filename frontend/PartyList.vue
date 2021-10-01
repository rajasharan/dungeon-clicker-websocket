<template>
  <div>
    <b>Party List</b>
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
};
</script>

<style scoped>
</style>
