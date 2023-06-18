<script setup lang="ts">
import { useForm } from '@/hooks/useForm'
import { isEmail, minlength, required } from '@/helpers/validators'
import { useRouter } from 'vue-router'
import type { IFormControl } from '@/types/FormControl'

import styles from './SignInView.module.css'
import { useUserStore } from '@/stores/user'

const router = useRouter()

const controls: IFormControl[] = [
  {
    title: 'Email',
    placeholder: 'Enter your email',
    type: 'email'
  },
  {
    title: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    visibility: true
  }
]

const form = useForm([
  {
    name: 'Email',
    value: '',
    validators: [
      { name: 'required', function: required },
      { name: 'isEmail', function: isEmail }
    ]
  },
  {
    name: 'Password',
    value: '',
    validators: [
      { name: 'required', function: required },
      { name: 'minlength', function: minlength(6) }
    ]
  }
])

const userStore = useUserStore()
const { signIn } = userStore

const submit = async () => {
  await signIn(form)

  router.push('/chat')
}
</script>

<template>
  <div :class="styles.wrapper">
    <VForm
      :class="styles.form"
      :controls="controls"
      title="Sign In"
      :form="form"
      @update_form="(key: string, val: string | number) => form[key].value = val"
      @submit.prevent="submit"
    >
      <div :class="styles.additional">
        Don't have an account?
        <router-link to="/signup" :class="styles.link">Sign up for free</router-link>
      </div>
    </VForm>
  </div>
</template>
