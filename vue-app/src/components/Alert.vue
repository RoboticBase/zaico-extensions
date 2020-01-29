<template>
  <div class="alert container">
    <b-alert
      :show="dismissCountDown"
      :variant="variant"
      dismissible
      @dismissed="dismissCountDown=0"
      @dismiss-count-down="countDownChanged"
    >
      {{ message }}
    </b-alert>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'alert',
  data: function () {
    return {
      dismissSecs: 5,
      dismissCountDown: 0
    }
  },
  computed: {
    ...mapGetters(['message', 'variant'])
  },
  methods: {
    ...mapMutations(['updateMessage']),
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
      if (this.dismissCountDown == 0) {
        this.updateMessage({message: '', variant: ''})
      }
    }
  },
  watch: {
    message(newValue) {
      if (newValue) {
        this.dismissCountDown = this.dismissSecs
      }
    }
  }
}
</script>
