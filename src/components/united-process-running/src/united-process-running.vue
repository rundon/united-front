<template>
  <div>
    <el-button type="primary" @click="completeTask()">{{ $t('process.completeTask') }}</el-button>
    <el-button type="warning" @click="rejectTask()">{{ $t('process.rejectTask') }}</el-button>
    <el-button type="success" @click="rollbackTask()">{{ $t('process.doBackRollback') }}</el-button>
    <el-button type="info" @click="entrustTask()">{{ $t('process.entrustTask') }}</el-button>
    <el-button type="danger" @click="terminationTask()">{{ $t('process.terminationTask') }}</el-button>
    <united-task-back v-if="renTaskBackVisible" ref="unitedTaskBack"></united-task-back>
    <united-task-entrust v-if="renTaskEntrustVisible" ref="unitedTaskEntrust"></united-task-entrust>
    <united-task-handle v-if="renTaskHandleVisible" ref="unitedTaskHandle"></united-task-handle>
  </div>
</template>

<script>
import UnitedTaskBack from './united-task-back'
import UnitedTaskEntrust from './united-task-entrust'
import UnitedTaskHandle from './united-task-handle'
export default {
  name: 'UnitedProcessRunning',
  data () {
    return {
      // 是否显示退回窗口
      renTaskBackVisible: false,
      renTaskEntrustVisible: false,
      renTaskHandleVisible: false,
      parentObj: null,
      dataForm: {
        taskId: '',
        businessKey: '',
        processDefinitionKey: '',
        processInstanceId: ''
      },
      // 回调函数
      callbacks: {
        taskHandleSuccessCallback: null,
        taskHandleErrorCallback: null
      }
    }
  },
  components: {
    UnitedTaskBack,
    UnitedTaskEntrust,
    UnitedTaskHandle
  },
  created () {
    this.$nextTick(() => {
    })
  },
  props: {
  },
  watch: {
  },
  methods: {
    completeTask () {
      this.renTaskHandleVisible = true
      this.$nextTick(() => {
        this.$refs.unitedTaskHandle.dataForm.taskId = this.dataForm.taskId
        this.$refs.unitedTaskHandle.callbacks = this.callbacks
        this.$refs.unitedTaskHandle.handleType = 'complete'
        this.$refs.unitedTaskHandle.init()
      })
    },
    rejectTask () {
      this.renTaskHandleVisible = true
      this.$nextTick(() => {
        this.$refs.unitedTaskHandle.dataForm.taskId = this.dataForm.taskId
        this.$refs.unitedTaskHandle.callbacks = this.callbacks
        this.$refs.unitedTaskHandle.handleType = 'reject'
        this.$refs.unitedTaskHandle.init()
      })
    },
    rollbackTask () {
      this.renTaskBackVisible = true
      this.$nextTick(() => {
        this.$refs.unitedTaskBack.dataForm.taskId = this.dataForm.taskId
        this.$refs.unitedTaskBack.dataForm.processInstanceId = this.dataForm.processInstanceId
        this.$refs.unitedTaskBack.callbacks = this.callbacks
        this.$refs.unitedTaskBack.init()
      })
    },
    entrustTask () {
      this.renTaskEntrustVisible = true
      this.$nextTick(() => {
        this.$refs.unitedTaskEntrust.dataForm.taskId = this.dataForm.taskId
        this.$refs.unitedTaskEntrust.callbacks = this.callbacks
        this.$refs.unitedTaskEntrust.init()
      })
    },
    terminationTask () {
      this.renTaskHandleVisible = true
      this.$nextTick(() => {
        this.$refs.unitedTaskHandle.dataForm.taskId = this.dataForm.taskId
        this.$refs.unitedTaskHandle.callbacks = this.callbacks
        this.$refs.unitedTaskHandle.handleType = 'termination'
        this.$refs.unitedTaskHandle.init()
      })
    }
  }
}
</script>
