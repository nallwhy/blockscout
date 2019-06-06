import $ from 'jquery'
import Chart from 'chart.js'
import {store} from '../pages/stakes.js'

$(function () {
  $('.js-become-candidate').on('click', function () {
    const el = '#becomeCandidateModal'
    if ($(el).length) {
      $(`${el} form`).unbind('submit')
      $(`${el} form`).submit(() => {
        const stake = parseInt($(`${el} [candidate-stake]`).val())
        const address = $(`${el} [mining-address]`).val()
        const contract = store.getState().stakingContract
        const account = store.getState().account
        contract.methods.addPool(stake * Math.pow(10, 18), address).send({
          from: account,
          gas: 400000,
          gasPrice: 1000000000
        })
        $(el).modal('hide')
        return false
      })
      $(el).modal()
    } else {
      const modal = '#warningStatusModal'
      $(`${modal} .modal-status-title`).text('Unauthorized')
      $(`${modal} .modal-status-text`).text('Please login with MetaMask')
      $(modal).modal()
    }
  })

  $('.js-remove-pool').on('click', function () {
    const modal = '#questionStatusModal'
    $(`${modal} .btn-line.accept`).unbind('click')
    $(`${modal} .btn-line.accept`).click(() => {
      const contract = store.getState().stakingContract
      const account = store.getState().account
      contract.methods.removeMyPool().send({
        from: account,
        gas: 400000,
        gasPrice: 1000000000
      })
    })
    $(`${modal} .btn-line.except`).unbind('click')
    $(`${modal} .btn-line.except`).click(() => {
      $(modal).modal('hide')
    })
    $(modal).modal()
  })
})

window.openValidatorInfoModal = function (id) {
  const el = $('#stakesModalWindows')
  const path = el.attr('current_path')

  $.getJSON(path, {modal_window: 'info', pool_hash: id})
    .done(function (response) {
      el.html(response.window)
      $('#validatorInfoModal').modal()
    })
}

window.openStakeModal = function (id) {
  const el = $('#stakesModalWindows')
  const path = el.attr('current_path')
  $('.modal').modal('hide')
  $('.modal-backdrop').remove()

  $.getJSON(path, {modal_window: 'make_stake', pool_hash: id})
    .done(function (response) {
      el.html(response.window)

      const modal = '#stakeModal'
      const progress = parseInt($(`${modal} .js-stakes-progress-data-progress`).text())
      const total = parseInt($(`${modal} .js-stakes-progress-data-total`).text())

      $(`${modal} form`).unbind('submit')
      $(`${modal} form`).submit(() => {
        const stake = $(`${modal} [name="amount"]`).val()
        const poolAddress = $(`${modal} [name="pool_address"]`).val()
        const contract = store.getState().stakingContract
        const account = store.getState().account
        contract.methods.stake(poolAddress, stake * Math.pow(10, 18)).send({
          from: account,
          gas: 400000,
          gasPrice: 1000000000
        })
        $(modal).modal('hide')
        return false
      })
      $(modal).modal()

      setupStakesProgress(progress, total, $(`${modal} .js-stakes-progress`))
    })
}

window.openWithdrawModal = function (id) {
  const el = $('#stakesModalWindows')
  const path = el.attr('current_path')
  $('.modal').modal('hide')
  $('.modal-backdrop').remove()

  $.getJSON(path, {modal_window: 'withdraw', pool_hash: id})
    .done(function (response) {
      el.html(response.window)

      const modal = '#withdrawModal'
      const progress = parseInt($(`${modal} .js-stakes-progress-data-progress`).text())
      const total = parseInt($(`${modal} .js-stakes-progress-data-total`).text())

      $(`${modal} form`).unbind('submit')
      $(`${modal} form`).submit(() => { return false })

      $(`${modal} .withdraw`).click(() => {
        const stake = $(`${modal} [name="amount"]`).val()
        const poolAddress = $(`${modal} [name="pool_address"]`).val()
        const contract = store.getState().stakingContract
        const account = store.getState().account
        contract.methods.withdraw(poolAddress, stake * Math.pow(10, 18)).send({
          from: account,
          gas: 400000,
          gasPrice: 1000000000
        })
        $(modal).modal('hide')
      })

      $(`${modal} .order_withdraw`).click(() => {
        const stake = $(`${modal} [name="amount"]`).val()
        const poolAddress = $(`${modal} [name="pool_address"]`).val()
        const contract = store.getState().stakingContract
        const account = store.getState().account
        contract.methods.orderWithdraw(poolAddress, stake * Math.pow(10, 18)).send({
          from: account,
          gas: 400000,
          gasPrice: 1000000000
        })
        $(modal).modal('hide')
      })

      $(modal).modal()

      setupStakesProgress(progress, total, $(`${modal} .js-stakes-progress`))
    })
}

window.openQuestionModal = function (id) {
  const modal = '#claimQuestion'
  $(`${modal} .btn-line.accept`).unbind('click')
  $(`${modal} .btn-line.accept`).click(() => window.openWithdrawModal(id))
  $(`${modal} .btn-line.except`).unbind('click')
  $(`${modal} .btn-line.except`).click(() => window.openClaimModal(id))
  $(modal).modal()
}

window.openClaimModal = function (id) {
  const el = $('#stakesModalWindows')
  const path = el.attr('current_path')
  $('.modal').modal('hide')
  $('.modal-backdrop').remove()

  $.getJSON(path, {modal_window: 'claim', pool_hash: id})
    .done(function (response) {
      el.html(response.window)

      const modal = '#claimModal'
      const progress = parseInt($(`${modal} .js-stakes-progress-data-progress`).text())
      const total = parseInt($(`${modal} .js-stakes-progress-data-total`).text())

      $(`${modal} form`).unbind('submit')
      $(`${modal} form`).submit(() => {
        const poolAddress = $(`${modal} [name="pool_address"]`).val()
        const contract = store.getState().stakingContract
        const account = store.getState().account
        contract.methods.claimOrderedWithdraw(poolAddress).send({
          from: account,
          gas: 400000,
          gasPrice: 1000000000
        })
        $(modal).modal('hide')
        return false
      })
      $(modal).modal()

      setupStakesProgress(progress, total, $(`${modal} .js-stakes-progress`))
    })
}

window.openMoveStakeModal = function (id) {
  const el = $('#stakesModalWindows')
  const path = el.attr('current_path')

  $.getJSON(path, {modal_window: 'move_stake', pool_hash: id})
    .done(function (response) {
      el.html(response.window)

      const modal = '#moveStakeModal'
      const progress = parseInt($(`${modal} .js-stakes-progress-data-progress`).text())
      const total = parseInt($(`${modal} .js-stakes-progress-data-total`).text())

      $(modal).modal()

      setupStakesProgress(progress, total, $(`${modal} .js-stakes-progress`))
    })
}

window.selectedStakeMovePool = function (fromHash, toHash) {
  const el = $('#stakesModalWindows')
  const path = el.attr('current_path')
  $('.modal').modal('hide')
  $('.modal-backdrop').remove()

  $.getJSON(path, {modal_window: 'move_selected', pool_hash: fromHash, pool_to: toHash})
    .done(function (response) {
      el.html(response.window)

      const modal = '#moveStakeModalSelected'
      var progressFrom = parseInt($(`${modal} .js-stakes-progress-data-progress.js-pool-from-progress`).text())
      var totalFrom = parseInt($(`${modal} .js-stakes-progress-data-total.js-pool-from-progress`).text())

      var progressTo = parseInt($(`${modal} .js-stakes-progress-data-progress.js-pool-to-progress`).text())
      var totalTo = parseInt($(`${modal} .js-stakes-progress-data-total.js-pool-to-progress`).text())

      $(`${modal} form`).unbind('submit')
      $(`${modal} form`).submit(() => {
        const poolFrom = $(`${modal} [name="pool_from"]`).val()
        const poolTo = $(`${modal} [name="pool_to"]`).val()
        const stake = $(`${modal} [name="amount"]`).val()
        const contract = store.getState().stakingContract
        const account = store.getState().account
        contract.methods.moveStake(poolFrom, poolTo, stake * Math.pow(10, 18)).send({
          from: account,
          gas: 400000,
          gasPrice: 1000000000
        })
        $(modal).modal('hide')
        return false
      })
      $(modal).modal()

      setupStakesProgress(progressFrom, totalFrom, $(`${modal} .js-pool-from-progress`))
      setupStakesProgress(progressTo, totalTo, $(`${modal} .js-pool-to-progress`))
    })
}

function setupStakesProgress (progress, total, progressElement) {
  const stakeProgress = progressElement
  const primaryColor = $('.btn-full-primary').css('background-color')
  const backgroundColors = [
    primaryColor,
    'rgba(202, 199, 226, 0.5)'
  ]
  const progressBackground = total - progress
  var data
  if (total > 0) {
    data = [progress, progressBackground]
  } else {
    data = [0, 1]
  }

  // eslint-disable-next-line no-unused-vars
  let myChart = new Chart(stakeProgress, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors,
        borderWidth: 0
      }]
    },
    options: {
      cutoutPercentage: 80,
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      }
    }
  })
}
