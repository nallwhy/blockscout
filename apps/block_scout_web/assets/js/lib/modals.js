import $ from 'jquery'
import Chart from 'chart.js'

$(function () {
  $('.js-become-candidate').on('click', function () {
    const el = $('#becomeCandidateModal');
    if(el.length) {
      el.modal();
    }
    else {
      const modal = '#warningStatusModal';
      $(`${modal} .modal-status-title`).text('Unauthorized');
      $(`${modal} .modal-status-text`).text('Please login with MetaMask');
      $(modal).modal();
    }
  })

  $('.js-remove-pool').on('click', function () {
    $('#warningStatusModal').modal()
  })
})

window.openValidatorInfoModal = function(id) {
  const el = $("#stakesModalWindows");
  const path = el.attr("current_path");

  $.getJSON(path, {modal_window: "info", pool_hash: id})
    .done(function(response) {
      el.html(response.window);
      $('#validatorInfoModal').modal();
    })
}

window.openStakeModal = function(id) {
  const el = $("#stakesModalWindows");
  const path = el.attr("current_path");
  $('.modal').modal('hide');
  $('.modal-backdrop').remove();

  $.getJSON(path, {modal_window: "make_stake", pool_hash: id})
    .done(function(response) {
      el.html(response.window);

      const modal = '#stakeModal';
      const progress = parseInt($(`${modal} .js-stakes-progress-data-progress`).text())
      const total = parseInt($(`${modal} .js-stakes-progress-data-total`).text())

      $(modal).modal()

      setupStakesProgress(progress, total, $(`${modal} .js-stakes-progress`))
    })
}

window.openWithdrawModal = function(id) {
  const el = $("#stakesModalWindows");
  const path = el.attr("current_path");
  $('.modal').modal('hide');
  $('.modal-backdrop').remove();

  $.getJSON(path, {modal_window: "withdraw", pool_hash: id})
    .done(function(response) {
      el.html(response.window);

      const modal = '#withdrawModal';
      const progress = parseInt($(`${modal} .js-stakes-progress-data-progress`).text())
      const total = parseInt($(`${modal} .js-stakes-progress-data-total`).text())

      $(modal).modal()

      setupStakesProgress(progress, total, $(`${modal} .js-stakes-progress`))
    })
}

window.openQuestionModal = function(id) {
  const modal = "#questionStatusModal";
  $(`${modal} .btn-line.positive`).unbind("click");
  $(`${modal} .btn-line.positive`).click(() => openWithdrawModal(id));
  $(`${modal} .btn-line.negative`).unbind("click");
  $(`${modal} .btn-line.negative`).click(() => openClaimModal(id));
  $(modal).modal();
}

window.openClaimModal = function(id) {
  const el = $("#stakesModalWindows");
  const path = el.attr("current_path");
  $('.modal').modal('hide');
  $('.modal-backdrop').remove();

  $.getJSON(path, {modal_window: "claim", pool_hash: id})
    .done(function(response) {
      el.html(response.window);

      const modal = '#claimModal';
      const progress = parseInt($(`${modal} .js-stakes-progress-data-progress`).text())
      const total = parseInt($(`${modal} .js-stakes-progress-data-total`).text())

      $(modal).modal()

      setupStakesProgress(progress, total, $(`${modal} .js-stakes-progress`))
    })
}

window.openMoveStakeModal = function(id) {
  const el = $("#stakesModalWindows");
  const path = el.attr("current_path");

  $.getJSON(path, {modal_window: "move_stake", pool_hash: id})
    .done(function(response) {
      el.html(response.window);

      const modal = '#moveStakeModal';
      const progress = parseInt($(`${modal} .js-stakes-progress-data-progress`).text())
      const total = parseInt($(`${modal} .js-stakes-progress-data-total`).text())

      $(modal).modal()

      setupStakesProgress(progress, total, $(`${modal} .js-stakes-progress`))
    })
}

window.selectedStakeMovePool = function(from_hash, to_hash) {
  const el = $("#stakesModalWindows");
  const path = el.attr("current_path");
  $('.modal').modal('hide');
  $('.modal-backdrop').remove();

  $.getJSON(path, {modal_window: "move_selected", pool_hash: from_hash, pool_to: to_hash})
    .done(function(response) {
      el.html(response.window);

      const modal = '#moveStakeModalSelected';
      var progress_from = parseInt($(`${modal} .js-stakes-progress-data-progress.js-pool-from-progress`).text())
      var total_from = parseInt($(`${modal} .js-stakes-progress-data-total.js-pool-from-progress`).text())

      var progress_to = parseInt($(`${modal} .js-stakes-progress-data-progress.js-pool-to-progress`).text())
      var total_to = parseInt($(`${modal} .js-stakes-progress-data-total.js-pool-to-progress`).text())  

      $(modal).modal();

      setupStakesProgress(progress_from, total_from, $(`${modal} .js-pool-from-progress`))
      setupStakesProgress(progress_to, total_to, $(`${modal} .js-pool-to-progress`))
    })
}

function setupStakesProgress (progress, total, progress_element) {
  const stakeProgress = progress_element;
  const primaryColor = $('.btn-full-primary').css('background-color')
  const backgroundColors = [
    primaryColor,
    'rgba(202, 199, 226, 0.5)'
  ]
  const progressBackground = total - progress
  var data;
  if(total > 0) {
    data = [progress, progressBackground];
  }
  else {
    data = [0, 1];
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