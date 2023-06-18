<script setup lang="ts">
import styles from './VLoader.module.css'
</script>

<script lang="ts">
export default {
  name: 'VLoader'
}
</script>

<template>
  <div :class="styles['lds-roller']">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>
