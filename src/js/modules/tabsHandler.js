function tabsHandler() {
  $(".js-tabs-nav").on("click", "button:not(.risk__tabs-btn--active)", function() {
   $(this)
     .addClass("risk__tabs-btn--active").siblings().removeClass("risk__tabs-btn--active")
     .closest(".js-tabs").find(".js-tab").removeClass("risk__content--active").eq($(this).index()).addClass("risk__content--active");
  });
}
