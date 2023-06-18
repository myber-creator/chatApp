<script setup lang="ts">
import styles from './VButton.module.css'
</script>

<script lang="ts">
export default {
  name: 'VButton'
}
</script>

<template>
  <button :class="styles.button"><slot></slot></button>
</template>
