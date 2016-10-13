function modalHandler() {
  var $modal = $(".js-modal-question");
  var $modalBtn = $(".js-modal-question-btn");
  var $modalExit = $(".js-modal-exit");

  $modalBtn.on("click", function() {
    $modal.fadeIn();
  });

  $modalExit.on("click", function() {
    $modal.fadeOut();
  });
}
