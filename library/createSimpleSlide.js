// best structure to control slide content
var slideContent = [
  { 
    title: "This is some title",
    text: "This is some text",
    //image: "",
    //custom: ""
    audio: 0 // starting index at 0
    second: 1
  },
  {
    title: "Title number two",
    text: "We probably hit the 10th second of the first audio",
    second: 10,
    audio: 0
  },
  {
    title: "Starting audio two",
    text: "This is the text for the second audio followed by a picture",
    second: 0,
    audio: 1
  },
  {
    title: "Audio 2 Image",
    image: "someImage.png",
    second: 10,
    audio: 1
  }
];

var audios = [

];

var AVIATION = AVIATION || {};

// begin a javascript class "Slide"
AVIATION.common = {};

AVIATION.common.Slide = function( options ){
  if(!options){
    options = {};
  }

	this["type"] = options["type"] || "simple"; // check which options are given and then assign a default
												                      // type maybe in constructor?
	this["options"] = options["options"];
	this.avatars = options.avatars;

  console.log("this inside Slide:");
  console.log(this);
};

AVIATION.common.Slide.prototype = {

  // constructor which initiates the building process
  constructor: function(){
  	// check type of slide and run the proper initFunc
    if (this["type"] === "simple"){
      console.log("simple type");
      this._initSimple( this["options"] );
    } else {
      console.log("not simple slide");
      this._initHighlights();
    }
  },

  // method that initializes building of simple slides
  _initSimple: function(options){
	  var avatars, content = [], audio = [];

  	var defaults = {
      showAvatars: false,
      showSlideControls: true,
      showStatus: true,
      showControls: true,
      showBorder: true
    };

    console.log("this initSimple:");
    console.log(this);

    if(!options){
      options = this["options"] || {};
    }

    for (option in defaults){
      // if this key doesn't exist, init to default
      if(!options[option]){
        options[option] = defaults[option]
      }
    }

    this["options"] = options;

    console.log("run simple");
    console.log(this);    

    try {
      // if smth might cause an error....
      this.container.nothingHere.text = "test";
      if(!this.container) throw "a container is required, thus provide an id";
    } catch(error){
      console.log("error: ");
      console.debug(error);
    } finally {
      console.log("using a default id instead");
      // do something to continue running
      this.container = "#slideContainer";
    }

    // let's add some elements to our base div inside the slide
    var container = $(this.container);

    if(options.showAvatars){
      this.buildAvatars();
    } else {
      this.buildContent();
    }
  },

  // method for building avatars into the slide
  buildAvatars: function(){
    console.log("buidling avatars");
    var avatarLeft, avatarRight;


  },

  // method for building the content of the slide
  buildContent: function(){
    console.log("building content");

    var content = jQuery('<div/>', {
      "class": "cdot_contentText col-xs-12",
      "html": "<h3>This is a title</h3><p>And some text</p>"
    }).appendTo(this.container);

  },

  buildSlideControls: function(){

  },

  buildCourseControls: function(){

  },
  /*
  buildHighlights: function(){

  },

  buildModals: function(){

  },
  */

};
/**
  var newSlide = new Slide();
  newSlide.constructor();
**/
/*
var testSlide = new Slide();
console.log("this is a test slide...");
console.log(testSlide);
*/
console.log("testing this class execution");