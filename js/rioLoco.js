dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.BasemapToggle");
dojo.require("esri.dijit.HomeButton");
function init(){
  
  loadShed();
  resizePanes();
  
  // Make the sidebar resizeable (horizontal only)
  jQuery("#sidebar").resizable({
    handles: 'e'
  });
  // Resize Panes when window or sidebar change size
  jQuery(window).resize(function () {
    resizePanes();
  });
  jQuery("#sidebar").resize(function(){
    resizePanes();
  });
  
  // Create basemap
  var map = new esri.Map("mapDiv", {
    center: [-66.462221, 18.26587],
    zoom: 9,
    basemap: "topo"
  });

  // Digit for toggling between two basemaps
  var toggle = new esri.dijit.BasemapToggle({
    map: map,
    basemap: "satellite"
  }, "BasemapToggle");
  toggle.startup();

  // Digit for a home button that zooms to the original extent
  var homeButton = new esri.dijit.HomeButton({
    map: map
  }, "HomeButton");
  homeButton.startup();

  // Minimalist template for popup window (title only)
  var infoTemplate = new esri.InfoTemplate("${Prj_Name}", " ");

  // Add feature layers from R4 ArcGIS Server; retrieve all fields from attribute table
  var projects = new esri.layers.FeatureLayer("http://ifw4ro-gis2:6080/arcgis/rest/services/RioLoco/Projects/MapServer/0",{
    infoTemplate: infoTemplate,
    visible: false,
    outFields: ["*"]
  });
  var watershed = new esri.layers.FeatureLayer("http://ifw4ro-gis2:6080/arcgis/rest/services/RioLoco/Watershed/MapServer/0",{
    outFields:["*"]
  });
  map.addLayers([watershed, projects]);
  
  // Extent of project locations
  var watershedExtent = new esri.geometry.Extent({
    "xmin":-7517941.62,
    "ymin":2005578.03,
    "xmax":-7380354.97,
    "ymax":2097302.47,
    "spatialReference":{"wkid":102100}
  });

  // Show the Layer toggle panel
  jQuery("#toggleLayer").hover(growDiv, shrinkDiv);
  function growDiv(){
    jQuery(this).append('<div class="myButton" id="shedButton">Watershed</div><div class="myButton" id="prjButton">Projects</div>').stop().animate({height:"110px", width:"100px"}, "fast");
    
    jQuery("#shedButton").click(function(){
      if (watershed.visible == true){
        watershed.hide();
      } else {
        watershed.show();
      }
    });
    jQuery("#prjButton").click(function(){
      if (projects.visible == true){
        projects.hide();
      } else {
        projects.show();
      }
    });
  }
  function shrinkDiv(){
    jQuery(this).html("<p>Layers...</p>").stop().animate({height:"20px", width:"70px"}, "fast");
  }
  
  // Change cursor to indicate feature layers are clickable
  projects.on("mouse-over", function() {

    map.setMapCursor("pointer");
  });
  projects.on("mouse-out", function() {
    map.setMapCursor("default");
  });

  // Update the sidebar with watershed info on click
  var shedClick = watershed.on("click", function(){
    loadShed();
  });
  // Update the sidebar with project information on click
  var pointClick = projects.on("click", function(e){
    
    // Build image slider using the current feature's photos
    imgSlider = '<div id="slider" class="camera_wrap">'
                  + '<div id="img1" data-src="' + e.graphic.attributes.photo1 + '"></div>'
                  + '<div id="img2" data-src="' + e.graphic.attributes.photo2 + '"></div>'
                  + '<div id="img3" data-src="' + e.graphic.attributes.photo3 + '"></div>'
                  + '</div> <!-- end of slider -->'
                  + '<hr>';

    // Fade out the infowindow, update the text, then fade back in
    jQuery("#infowindow").fadeOut(500, function(){
      jQuery("#prjTitle").html("<h1>" + e.graphic.attributes.Prj_Name + "</h1>");
      jQuery("#prjDescription").html(e.graphic.attributes.Description);
      jQuery("#imgContainer").html(imgSlider);
      jQuery('#slider').camera({
        navigation:false,
        playPause:false
      });
      jQuery(this).fadeIn(500);
    });
  });

  // Toggle the active tab
  jQuery(".tab").click(function(){
    jQuery(".tab").removeClass("active");
    jQuery(this).addClass("active");
  });

  // Turn on/off feature layer depending on which tab is active
  jQuery("#shedMap").click(function(){
    projects.hide();
    watershed.show();
    jQuery('#mapDiv').css("border", "15px solid #284b5f");
    jQuery('body').css("background", "#284b5f");
    loadShed();
  });

  jQuery("#prjMap").click(function(){
    projects.show();
    jQuery('#mapDiv').css("border", "15px solid #8cac65");
    jQuery('body').css("background", "#8cac65");
  });
}

function loadShed(){
  if (jQuery("#prjTitle").html() !== "<h1>The Rio Loco Watershed</h1>"){
    var shedSlider = '<div id="slider1" class="camera_wrap">'
                   +    '<div id="img1" data-src="img/shed.jpg"></div>'
                   +    '<div id="img2" data-src="img/upper2.jpg"></div>'
                   +    '<div id="img3" data-src="img/upper3.jpg"></div>'
                   + '</div> <!-- end of slider --><hr>';

    jQuery("#prjTitle").html("<h1>The Rio Loco Watershed</h1>");
    jQuery("#prjDescription").html("<p>The Río Loco Watershed Project (RLWP) began in 2009 as a multiagency effort to support the USCRTF Local Action Strategies (LAS) as identified in the Guánica Bay Watershed Management Plan. NRCS work seeks to address LAS at Río Loco related to land based sources of pollution by reducing loss of coral reef cover through the promotion and application of integrated watershed and land use management practices on agricultural lands.</p>");
    jQuery("#imgContainer").html(shedSlider);
    jQuery('#slider1').camera({
      navigation:false,
      playPause:false
    });
  }
}

function resizePanes(){
  var windowWidth   = jQuery(window).width();
  var windowHeight  = jQuery(window).height();
  var sidebarWidth  = jQuery("#sidebar").width();
  var offsets       = jQuery("#prjDescription").offset();

  jQuery('#mapDiv').width(windowWidth - sidebarWidth-32);
  jQuery('#mapDiv_root').width(windowWidth - sidebarWidth-32);
  jQuery('#mapDiv_container').width(windowWidth - sidebarWidth-32);
  jQuery('#mapDiv_layers').width(windowWidth - sidebarWidth-32);
  jQuery('#mapDiv_layer0').width(windowWidth - sidebarWidth-32);

  jQuery('#mapDiv').height(windowHeight - 155);
  var mapHeight = jQuery("#mapDiv").height();
  jQuery('#infoWindow').height(windowHeight - 155);
  jQuery('#handle').height(windowHeight - 125);
  jQuery('#sidebar').height(mapHeight + 30);
  jQuery('#prjDescription').height(windowHeight - offsets.top - 70);
}




dojo.ready(init);