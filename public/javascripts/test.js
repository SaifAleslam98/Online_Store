$("document").ready(function(){
  $(".tab-slider--body").hide();
  $(".tab-slider--body:first").show();
});

$(".tab-slider--nav li").click(function() {
  $(".tab-slider--body").hide();
  var activeTab = $(this).attr("rel");
  $("#"+activeTab).fadeIn();
  if($(this).attr("rel") == "tab2"){
    $('.tab-slider--tabs').addClass('slide');
  }else{
    $('.tab-slider--tabs').removeClass('slide');
  }
  $(".tab-slider--nav li").removeClass("active");
  $(this).addClass("active");
});

function openNav() {
  document.getElementById("mySidenav").style.width = "100%";
  document.getElementById("mySidenav").style.display = "flex";
  document.getElementById("mySidenav").style.flexDirection = "column";

  document.getElementById("mySidenav").style.alignItems = "center";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";

}

window.onscroll = function () { scrollFunction() };

function scrollFunction() {
  if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
      document.getElementById("nav-bar").classList.remove("nav-bar");
      document.getElementById("nav-bar").classList.add("scroll-nav");
      document.getElementById("nav-bar").style.height = "50px";


  } else {
      document.getElementById("nav-bar").classList.remove("scroll-nav");
      document.getElementById("nav-bar").classList.add("nav-bar");
      document.getElementById("nav-bar").style.height = "70px";

  }
}