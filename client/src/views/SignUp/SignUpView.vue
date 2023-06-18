<script setup lang="ts">
import { useForm } from '@/hooks/useForm'
import { required, minlength, isEmail } from '@/helpers/validators'
import { useRouter } from 'vue-router'
import type { IFormControl } from '@/types/FormControl'
import styles from './SignUpView.module.css'
import { useUserStore } from '@/stores/user'
import type { INewUser } from '@/types/Users'

const router = useRouter()

const controls: IFormControl[] = [
  {
    title: 'Username',
    placeholder: 'Enter your username'
  },
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

const form: INewUser = useForm([
  {
    name: 'Username',
    value: '',
    validators: [
      { name: 'required', function: required },
      { name: 'minlength', function: minlength(4) }
    ]
  },
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
const { signUp } = userStore

const submit = async () => {
  await signUp(form)

  router.push('/chat')
}
</script>

<template>
  <div :class="styles.wrapper">
    <VForm
      :class="styles.form"
      :controls="controls"
      title="Sign Up"
      :form="form"
      @update_form="(key: string, val: string | number) => form[key].value = val"
      @submit.prevent="submit"
    >
      <div :class="styles.additional">
        Do you already have an account?
        <router-link to="/signin" :class="styles.link">Sign in</router-link>
      </div>
    </VForm>
  </div>
</template>
