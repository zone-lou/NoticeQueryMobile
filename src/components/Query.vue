<script setup lang="ts">
import { reactive, ref, onMounted,getCurrentInstance} from "vue";
import axios from "axios";
const internalInstance = getCurrentInstance();
const active = ref(0);
const list = reactive([]);
const loading = ref(false);
const companyName = ref("规划设计招标公告");
const finished = ref(false);
const params=reactive({
  pageNo:1,
  pageSize:10,
  keyword:"",
  fileUrl:"/toubiao/data/notice.csv",
  total:0,
})
//规划和工程的数据都从notice.csv取，然后做规划和工程筛选
const fileList=reactive([
    {fileUrl:"/toubiao/data/notice.csv",type:"规划",name:"规划设计招标公告"},
    {fileUrl:"/toubiao/data/notice.csv",type:"工程",name:"工程设计招标公告"},
    {fileUrl:"/toubiao/data/gov.csv",type:"",name:"政府中标公示"},
    {fileUrl:"/toubiao/data/noGov.csv",type:"",name:"企业中标公示"}
])
onMounted(async () => {
  await getCsvData();
});
const toDeatil = (item) => {
  console.log(item, "点击行");
  let url = "";
  //如果有htmlUrl ，则为义乌采购网直接赋值
  if (item.isYW == 1) {
    url = item.articleId;
  }
  //没有则为浙江采购，拼接
  else {
    url =
        "https://zfcg.czt.zj.gov.cn/luban/detail?parentId=600007&articleId=" +
        item.articleId;
  }
  window.open(url);
};
const onSearch = (val) => {
  list.length = 0;
  params.pageNo=1
  params.total=0
  getCsvData()
};
const onLoad = () => {
  setTimeout(() => {
    getCsvData()
    //增加页数
    params.pageNo++
    // 加载状态结束
    loading.value = false;
    // 数据全部加载完成
    if (list.length >= params.total) {
      finished.value = true;
    }
  }, 1000);
};
const tabsChange=(name,title)=>{
  console.log(name,title,'0000')
  list.length = 0;
  params.fileUrl=fileList[name].fileUrl
  companyName.value=fileList[name].name
  params.pageNo=1
  params.total=0
  getCsvData()
}
const getCsvData = () => {
  axios.get(params.fileUrl).then((response) => {
    let lines = response.data.split("\n");
    let result = [];
    let headers = lines[0].split(",");
    for (let i = 1; i < lines.length; i++) {
      interface ob{
        [key:string]:any
      }
      let obj:ob = {};
      let currentline = lines[i].split(",");
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      //排除非空字段为空的数据
      if (!obj.articleId || !obj.title || !obj.publishDate) {
        continue;
      }
      if(fileList[active.value].type=="工程"&&obj.title.indexOf("工程") <= 0){
        continue;
      }
      if(fileList[active.value].type=="规划"&&obj.title.indexOf("工程") > 0){
        continue;
      }
      //先对数据做筛选，减少后续操作的数据量
      //关键词筛选
      if (params.keyword) {
        if (obj.title && obj.title.indexOf(params.keyword) <= 0) {
          continue;
        }
      }
      // //时间筛选
      // if (params.publishDate) {
      //   if (
      //       obj.publishDate &&
      //       (obj.publishDate <
      //           Date.parse(new Date(params.publishDate[0])) ||
      //           obj.publishDate >
      //           Date.parse(new Date(params.publishDate[1])))
      //   ) {
      //     continue;
      //   }
      // }
      result.push(obj);
    }
    //按照时间排序
    result.sort((a, b) => {
      return b.publishDate - a.publishDate;
    });
    params.total = result.length;
    let startRecord = (params.pageNo - 1) * params.pageSize;
    let endRecord = params.pageNo * params.pageSize;
    let finalResult = result.slice(startRecord, endRecord);
    finalResult.forEach((item) => {
      //先判断标题里面是否有[],有的话取[]里面的信息当做采购公司信息
      let startIndex=item.title.indexOf('[')
      let endIndex=item.title.indexOf(']')
      if(startIndex>0&&endIndex>0){
        item.companyName=item.title.substring(startIndex+1,endIndex)
        item.title=item.title.substring(0,startIndex)
      }
      else{
        item.companyName=companyName.value
      }
      list.push(item);
    });
  });
};

</script>
<template>
  <van-nav-bar title="汉宇设计招投标信息网" :border="false"/>
  <div class="content">
    <van-search
        v-model="params.keyword"
        shape="round"
        background="#4f6aff"
        placeholder="请输入关键字"
        @search="onSearch"
    />
    <div class="card">
      <van-tabs v-model:active="active" :ellipsis="false" line-width="80" @change="tabsChange">
        <van-tab v-for="item in fileList" :title="item.name"></van-tab>
      </van-tabs>
      <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
      >
        <van-cell v-for="item in list" :key="item.articleId"  @click="toDeatil(item)" >
          <div>
            <div>
              <div class="title_box">
                {{item.title}}
              </div>
              <div class="foot_desc">
                {{item.companyName}} {{ internalInstance.appContext.config.globalProperties
                  .$moment(Number(item.publishDate))
                  .format("YYYY-MM-DD")}}
              </div>
            </div>
          </div>
        </van-cell>
      </van-list>
    </div>
  </div>
</template>

<style scoped>
.van-nav-bar{
  background:#4f6aff;
}
 ::v-deep .van-nav-bar__title{
  color: white;
}
 .content{
   display: flex;
   flex-direction: column;
   background-color: #4f6aff;
   margin-top: -1px;
   height: 100%;
 }
 .card{
   border-radius: 60px 60px 0px 0px;
   background-color: white;
   padding: 40px 20px 0 20px;
 }
 .title_box{
   font-size: 40px;
   font-family: PingFang SC;
   font-weight: 500;
   color: #333333;
   text-align: left;
 }
 .foot_desc{
   font-size: 25px;
   font-family: PingFang SC;
   font-weight: 500;
   color: #8994A9;
   text-align: left;
   margin-top: 10px;
 }

</style>
