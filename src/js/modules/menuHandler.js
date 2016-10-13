function menuHandler() {
  var $nav = $(".js-nav");
  var $content = $(".js-content");
  var $toggle = $(".js-toggle");

  $nav.addClass("nav--closed");

  $toggle.on("click", function(e) {
    e.preventDefault();
    $nav.toggleClass("nav--closed");
    $nav.toggleClass("nav--opened");
    $content.toggleClass("content__inner--opened");
  });
}
