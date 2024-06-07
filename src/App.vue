<script setup>
import { buildGraph } from "./d3.js";
import VueDatePicker from '@vuepic/vue-datepicker';
import BounceLoader from 'vue-spinner/src/BounceLoader.vue'
import { ref, reactive, watch } from "vue";
const minprice = ref(0);
const maxprice = ref(1000);
const date = ref(new Date());
const data = ref([]);
const name = ref("LA1");
const graph = ref();
const loading = ref(false);
const invalid = ref(true);
const msg = ref("Test");
const warning_text = reactive({
  "minPrice": null,
  "maxPrice": null,
  "date": ""
});
const options = [
  { name: "甘藍-初秋(高麗菜,捲心菜)", value: "LA1" },
  { name: "甘藍-改良種(高麗菜,捲心菜)", value: "LA2" },
  { name: "甘藍-甜甘藍(高麗菜,捲心菜)", value: "LA3" },
  { name: "甘藍-紫色(高麗菜,捲心菜)", value: "LA4" },
  { name: "甘藍-甘藍心(高麗菜,捲心菜)", value: "LA5" },
  { name: "甘藍-甘藍芽(高麗菜,捲心菜)", value: "LA6" },
];

watch([name, minprice, maxprice, date], ([newName, newMinprice, newMaxprice, newDate], [oldName, oldMinprice, oldMaxprice, oldDate]) => {
  warning_text.date = "";
  warning_text.minPrice = null;
  warning_text.maxPrice = null;
  invalid.value = true;
})

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`
}

const isInvalid = () => {
  if(minprice.value < 0){
    warning_text.minPrice = "不能為負數";
    invalid.value = false;
  }
  if(maxprice.value > 1000){
    warning_text.maxPrice = "不能超過 1000";
    invalid.value = false;
  }
  if(date.value > new Date()){
    warning_text.date = "最新資料只到 " + formatDate(new Date());
    invalid.value = false;
  }
}

const handleSearch = async () => {
  isInvalid();
  if(!invalid.value) return;
  graph._value.innerHTML = "";
  data.value = await FetchData({
    name: name.value,
    lowPrice: parseInt(minprice.value),
    highPrice: parseInt(maxprice.value),
    date: formatDate(date.value)
  });
  if(data.value.length == 0){
    data.value = [{
      date: "查無資料",
      avgPrice: "查無資料",
      lowPrice: "查無資料",
      highPrice: "查無資料",
      totalPrice: "查無資料"
    }]
  }
  buildGraph(data.value);
};

const baseurl = "https://albums-cp-envelope-portion.trycloudflare.com";
const FetchData = (searchItems) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    loading.value = true;
    xhr.open("POST", baseurl + "/fetch_data", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
          loading.value = false;
        } else {
          const error = new Error("Network response was not ok");
          console.error(
            "There was a problem with your fetch operation:",
            error
          );
          reject(error);
        }
      }
    };
    xhr.send(JSON.stringify(searchItems));
  });
};
</script>

<template>  
    <div class="container-lg">
      <div class="row align-items-center justify-content-center">
        <div class="col">
          <label class="form-label">商品名稱</label>
          <select
            id="name_input"
            class="form-select form-select-ms"
            aria-label="Default select example"
            v-model="name"
          >
            <option v-for="option in options" :value="option.value">
              {{ option.name }}
            </option>
          </select>
        </div>
        <div class="col">
          <p v-if="warning_text.minPrice" class="warning-text">{{ warning_text.minPrice }}</p>
          <label class="form-label">商品最低價格</label>
          <input
            id="low_price_input"
            type="number"
            class="form-control"
            name="low_price_input"
            placeholder="輸入查詢價格"
            v-model="minprice"
          />
        </div>
        <div class="col">
          <p v-if="warning_text.maxPrice" class="warning-text">{{ warning_text.maxPrice }}</p>
          <label class="form-label">商品最高價格</label>
          <input
            id="high_price_input"
            type="number"
            class="form-control"
            name="high_price_input"
            placeholder="輸入查詢價格"
            v-model="maxprice"
          />
        </div>
        <div class="col">
          <p v-if="warning_text.date" class="warning-text">{{ warning_text.date }}</p>
          <label>選擇開始查詢日期</label>
          <div class="input-group date" id="date1">
            <VueDatePicker v-model="date"></VueDatePicker>
          </div>
        </div>
        <div class="col-2">
          <button
            @click="handleSearch"
            id="submit"
            type="button"
            class="btn btn-primary btn-lg button-39"
          >
            Search
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <bounce-loader :loading="loading"></bounce-loader>
    </div>
    <div ref="graph" id="graph" class="aGraph"></div>
    <div class="container-lg">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">日期</th>
            <th scope="col">平均價格</th>
            <th scope="col">總價格</th>
            <th scope="col">最低價格</th>
            <th scope="col">最高價格</th>
          </tr>
        </thead>
        <tbody id="priceTable">
          <tr v-for="(d, index) in data" :key="index">
            <th scope="row">{{ d.date }}</th>
            <td>{{ d.avgPrice }}</td>
            <td>{{ d.totalPrice }}</td>
            <td>{{ d.lowPrice }}</td>
            <td>{{ d.highPrice }}</td>
          </tr>
        </tbody>
      </table>
    </div>
</template>

<style lang="css">
@import "assets/chart.css";
</style>