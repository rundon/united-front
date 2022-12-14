<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-activiti__model">
      <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
        <el-form-item>
          <el-input v-model="dataForm.name" :placeholder="$t('model.name')" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="dataForm.key" :placeholder="$t('model.key')" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="getDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="deleteHandle()">{{ $t('deleteBatch') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="dataListLoading"
        :data="dataList"
        border
        @selection-change="dataListSelectionChangeHandle"
        @sort-change="dataListSortChangeHandle"
        style="width: 100%;">
        <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
        <el-table-column prop="name" :label="$t('model.name')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="key" :label="$t('model.key')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="version" :label="$t('model.version')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="createTime" :label="$t('model.createTime')" header-align="center" align="center" width="180"></el-table-column>
        <el-table-column prop="lastUpdateTime" :label="$t('model.lastUpdateTime')" header-align="center" align="center" width="180"></el-table-column>
        <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
          <template slot-scope="scope">
            <a :href="getModelerURL(scope.row.id)" target="_blank" class="el-button el-button--text el-button--small">{{ $t('model.design') }}</a>
            <el-button type="text" size="small" @click="deployHandle(scope.row.id)">{{ $t('model.deploy') }}</el-button>
            <a :href="getExportURL(scope.row.id)" target="_blank" class="el-button el-button--text el-button--small">{{ $t('export') }}</a>
            <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">{{ $t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="pageSizeChangeHandle"
        @current-change="pageCurrentChangeHandle">
      </el-pagination>
      <!-- ??????, ?????? / ?????? -->
      <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    </div>
  </el-card>
</template>

<script>
import mixinViewModule from '@/mixins/view-module'
import AddOrUpdate from './model-add-or-update'
import qs from 'qs'

export default {
  mixins: [mixinViewModule],
  data () {
    return {
      mixinViewModuleOptions: {
        getDataListURL: '/api/act/model/page',
        getDataListIsPage: true,
        deleteURL: '/api/act/model',
        deleteIsBatch: true
      },
      dataForm: {
        name: '',
        key: ''
      }
    }
  },
  components: {
    AddOrUpdate
  },
  methods: {
    // ??????????????????url??????
    getModelerURL (id) {
      var params = qs.stringify({
        'access_token': this.$store.state.token,
        'modelId': id
      })
      return `${window.SITE_CONFIG['apiURL']}/modeler.html?${params}`
    },
    // ????????????url??????
    getExportURL (id) {
      var params = qs.stringify({
        'access_token': this.$store.state.token
      })
      return `${window.SITE_CONFIG['apiURL']}/api/act/model/export/${id}?${params}`
    },
    // ??????
    deployHandle (id) {
      this.$confirm(this.$t('prompt.info', { 'handle': this.$t('model.deploy') }), this.$t('prompt.title'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        this.$http.post(`/api/act/model/deploy/${id}`).then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.msg)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.getDataList()
            }
          })
        }).catch(() => {})
      }).catch(() => {})
    }
  }
}
</script>
