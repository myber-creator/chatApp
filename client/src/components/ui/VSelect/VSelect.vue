<template>
  <div class="w-full z-20 text-white">
    <Listbox
      :model-value="modelValue"
      @update:model-value="(value: string) => emits('update:modelValue', value)"
    >
      <div class="relative mt-1">
        <ListboxButton
          class="relative w-full cursor-default rounded-lg bg-secondary border border-slate-500 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-slate-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 sm:text-sm"
        >
          <span class="block truncate font-bold">{{ modelValue }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <span class="material-symbols-outlined"> expand_more </span>
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-secondary py-1 text-base border border-slate-500 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            <ListboxOption
              v-slot="{ active, selected }"
              v-for="option in props.options"
              :key="option"
              :value="option"
              as="template"
            >
              <li
                :class="[
                  active ? 'bg-slate-600' : 'text-gray-900',
                  'relative cursor-default select-none py-2 pl-10 pr-4 text-white'
                ]"
              >
                <span :class="[selected ? 'font-bold' : 'font-normal', 'block truncate']">{{
                  option
                }}</span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-white"
                >
                  <span class="material-symbols-outlined"> done </span>
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>

<script lang="ts">
export default {
  name: 'VSelect'
}
</script>

<script lang="ts" setup>
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'

type Props = {
  options: string[]
  modelValue: string
}

type Emits = {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
</script>
