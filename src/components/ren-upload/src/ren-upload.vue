<template>
  <uploader
    ref="uploader"
    :options="options"
    :autoStart="false"
    :file-status-text="fileStatusText"
    @file-progress="onFileProgress"
    @file-added="onFileAdded"
    @file-success="onFileSuccess"
    @file-error="onFileError"
    class="uploader-app"
    v-if="isShow"
  >
      <uploader-unsupport></uploader-unsupport>
      <uploader-btn id="global-uploader-btn" ref="uploadBtn">选择文件</uploader-btn>
      <el-dialog
        title="下载进度"
        :modal="false"
        :visible.sync="showprogress"
        :destroy-on-close="true"
        width="40%">
        <uploader-list>
          <div slot-scope="props">
            <li v-for="file in props.fileList" :key="file.id">
                <uploader-file :class="'file_' + file.id" ref="files" :file="file" :list="true"></uploader-file>
            </li>
          </div>
        </uploader-list>
      </el-dialog>
  </uploader>
</template>

<script>
import SparkMD5 from 'spark-md5';
export default {
name: 'RenUpload',
props: {
  title: String,
  api: {
    type: String,
    default:'/api/oss/upload',
  },
  onlyShow: Boolean,
  isShow: {
    type: Boolean,
    default: true,
  },
  params: {
    type: Object,
  },
},
created() {
  this.options.target =  window.SITE_CONFIG['apiURL']+this.api
},
data() {
  return {
    options: {
          target:'', // 目标上传 URL
          chunkSize: '10485760', //分块大小
          fileParameterName: 'file', //上传文件时文件的参数名，默认file
          maxChunkRetries: 3, //最大自动失败重试上传次数
          testChunks: true, //是否开启服务器分片校验
          query: this.params,
          processParams(params) {//每一次分片传给后台的参数，params是该方法返回的形参，包含分片信息
            return {//返回一个对象，会添加到每一个分片的请求参数里面
              chunks: params.totalChunks,
              chunk: params.chunkNumber,
              size: params.currentChunkSize,
              name: params.filename,
              md5: params.md5,
              total: params.total
            };
          },
          // 服务器分片校验函数，秒传及断点续传基础
          checkChunkUploadedByResponse: function (chunk, message) {
              let objMessage = JSON.parse(message);
              debugger
              console.log(objMessage.data)
              if (objMessage.data.resultStatus.value === 100) {
                  return true;
              }

              return (objMessage.missChunkList || []).indexOf(chunk.offset + 1) >= 0
          },
          headers: {
        // 在header中添加的验证，请根据实际业务来
              Authorization: 'Bearer '+this.$store.state.token
          }
    },
    statusTextMap: {
          success: '上传成功',
          error: '上传出错了',
          uploading: '上传中...',
          paused: '暂停',
          waiting: '等待中...',
          cmd5: '计算md5...'
      },
      fileStatusText: (status, response) => {
          return this.statusTextMap[status];
      },
      showprogress: false,
  };
},
computed: {
  //Uploader实例
  uploader() {
    return this.$refs.uploader.uploader;
  }
},
methods: {
  downs() {
    var alink = document.createElement("a");
    alink.href = this.shop.shoppic_url;
    alink.download = "pic"; //图片名
    alink.click();
  },
  onFileProgress(rootFile, file, chunk) {
     console.log(`上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${chunk.endByte / 1024 / 1024}`)
  },
  beforeupload() {
    console.log("开始上传");
    this.$emit('update', 'false');
  },
  onFileAdded(file) {
    this.computeMD5(file);
    this.showprogress = true;
  },
  computeMD5(file) {
    let fileReader = new FileReader();
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    let currentChunk = 0;
    const chunkSize = 10 * 1024 * 1000;
    let chunks = Math.ceil(file.size / chunkSize);
    let spark = new SparkMD5.ArrayBuffer();
    // 文件状态设为"计算MD5"
    file.pause();
    loadNext();
    fileReader.onload = (e => {
      spark.append(e.target.result);
      if (currentChunk > chunks) {
        currentChunk++;
        loadNext();
        // 实时展示MD5的计算进度
        console.log(((currentChunk/chunks)*100).toFixed(0)+'%')
      } else {
        let md5 = spark.end();
        this.computeMD5Success(md5, file);
       }
    });
    fileReader.onerror = function () {
      this.error(`文件${file.name}读取出错，请检查该文件`);
      file.cancel();
      };
      function loadNext() {
        let start = currentChunk * chunkSize;
        let end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
  },
  computeMD5Success(md5, file) {
              // 将自定义参数直接加载uploader实例的opts上
              Object.assign(this.uploader.opts, {
                  query: {
                      ...this.params,
                  }
              });
              file.uniqueIdentifier = md5;
              this.uploader.opts.query.md5 = md5;
              this.uploader.opts.query.total = file.size;
              file.resume();
  },
  // 上传成功
  onFileSuccess(rootFile, file, chunk) {
    this.showprogress = false;
      // 更新文件列表
    this.$emit('update', file);
    console.log("上传成功");
  },
  onFileError(rootFile, file, response, chunk) {
	  console.log(error)
  }
},
};
</script>

<style>
.table .table-tool{
    display: flex;
    justify-content: space-around;
    align-items: center;
}
.table .table-tool .icon{
      cursor: pointer;
}

.container-header {
  padding: 30px 0 20px;
  overflow: hidden;
}
.container-header.section-sub-title {
    font-weight: 700;
}

.section-fixed-btn {
  position: absolute;
  right: 30px;
  top: 90px;
}
.section-fixed-btn .el-button{
    border: 1px solid #fff;
}

.uploader-app{
  float: right;
}
#global-uploader-btn{
  color: #FFF;
  background-color: #17B3A3;
  border-color: #17B3A3;
  font-weight: 500;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
  line-height: 1;
}
.uploader-file-remove,.uploader-file-icon{
  display: none !important;
}
.uploader-list li{
    margin-bottom: 20px;
}
ul, ol, li {
    list-style: none;
}
.el-dialog__header {
    background-color: #eee;
}
</style>