import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import components from './components/ui/index'
import directives from './directives'

const app = createApp(App)

app.use(createPinia())
app.use(router)

for (const component of components) {
  app.component(component.name, component)
}

for (const directive of directives) {
  app.directive(directive.name, directive)
}

app.mount('#app')
