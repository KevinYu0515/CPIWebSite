import { createApp } from 'vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import App from './App.vue';

const app = createApp(App);
app.component('VueDatePicker', VueDatePicker);
app.mount('#app');