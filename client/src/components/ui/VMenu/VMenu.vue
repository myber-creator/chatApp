<script setup lang="ts">
import type { MenuPosition, MenuSection } from '@/types/Menu'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

type Props = {
  position: MenuPosition
  sections: MenuSection[]
}

const props = defineProps<Props>()
</script>

<script lang="ts">
export default {
  name: 'VMenu'
}
</script>

<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        class="inline-flex w-full justify-center rounded-md bg-opacity-20 px-4 py-2 text-sm font-medium text-white 0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        ref="menuButton"
      >
        <slot></slot>
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute w-56 origin-top-right divide-y divide-slate-500 rounded-md bg-secondary border border-slate-500 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-white z-30"
        :class="[
          { 'left-0': props.position.left },
          { 'bottom-12': props.position.bottom },
          { 'right-0': props.position.right },
          { 'top-10': props.position.top }
        ]"
      >
        <div class="px-1 py-1" v-for="(section, index) in props.sections" :key="index">
          <MenuItem
            v-slot="{ active }"
            class="text-white"
            v-for="(button, index) in section.buttons"
            :key="index"
            @click="button.function()"
          >
            <button
              :class="[
                active ? `${button.color} text-white` : 'text-gray-900',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm'
              ]"
            >
              <component class="mr-2" :is="button.icon" />
              {{ button.text }}
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>
