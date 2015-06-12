// TODOs:
/*
    destroy method
    and create method vs init to accept one json object only
    add jQuery.pulse: http://jsoverson.github.io/jquery.pulse.js/ when changing content/title to highlight it for the user

*/

/***
  *   Custom library/framework to speed up content development
  *   for the edX Aviation project at CDOT
  *   created by: Pavlo Kuzhel
  *   May 12, 2015
  *   GitHub wiki: https://github.com/CDOT-EDX/Project/wiki/Slide-Creation-reference
  **/

/*jslint white: true*/
/*jslint nomen: true*/
/*jslint plusplus: true*/
/*jslint todo: true*/
var AVIATION = AVIATION || {};

AVIATION.common = {};

// begin a javascript class "Slide"
AVIATION.common.Slide = function (options, slideContent, audioFiles) {
  "use strict";
  //var md = new MobileDetect(window.navigator.userAgent);
/*
  if(md){
    this.isMobile = md.mobile();
  } else {
    this.isMobile = false;
  }
*/
  if(!options){
    options = {};
  }

  this.type = options.type || "simple"; // check which options are given and then assign a default
                                              // type maybe in constructor?
  this.options = options;

  this.activeIndex = options.activeIndex || 0;

  this.slideContent = slideContent || [
                                        { 
                                          title: "No Content Provided",
                                          content: "Check your slideContent object", 
                                          audio: 0
                                        }
                                      ];

  this.audioFiles = audioFiles; //["//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_Slide2_Tom.mp3"];
  this.slideAudios = []; // init an empty array to store audio (popcorn) elements in
  this.slideHasListened = []; // store which audios have been listened to

  this.slideElements = {}; // will have status bar / control buttons / title / content and so on

  this.slideTimer = -1;

  console.log("this inside Slide:");
  console.log(this);

  // load requirements
  /*
  if(typeof($.fn.modal) === 'undefined'){
    console.log("TYPE OF MODAL: " + typeof $().modal );
    $.getScript( "https://online.cdot.senecacollege.ca:25080/aviation/js/bootstrap.min.js", function(){
      console.log("loaded bootstrap js");
    });
  }
  */

};

AVIATION.common.Slide.prototype = {

  // constructor which initiates the building process
  constructor: function(){
    "use strict";
    // check type of slide and run the proper initFunc
    if (this.type === "simple"){
      console.log("simple type");
      console.log(this.options);
      this._initSimple( this.options );
    } else {
      console.log("not simple slide");
      this._initPanel( this.options );
    }
  },

  // method that initializes building of simple slides
  _initSimple: function(options){
    "use strict";

    this.initDefaults(options);

    this.buildSlide();

  },

  // build titles on the slide
  buildHeader: function(parent, content, setupContent, clearTitle, callback){
    "use strict";
    var headerElement = $(this.headerId), slide = this,// + "_" + content.audio + "_" + (content.second || 0) ), slide = this,
        xButton, newTitle;

    console.log("building the header");
    console.log(headerElement);
    console.log("whos the parent?");
    console.log(parent);

    this.buildAvatars(parent, content.avatar, function(bsSize){
      if(content.title && content.title.html){
        var classes = "", newHeader;

        if(content.title.classes){
          classes = content.title.classes.join(" ");
        }

        if(!slide.options.isModal){
          console.log("theres no header and not a modal, create it");
          newHeader = jQuery('<h3/>',{
            //TODO: find automatically generated title id/index
            "id": slide.headerId.split("#")[1],// + "_" + content.audio + "_" + (content.second || 0),
            "class": "text-center " + classes,
            html: content.title.html || ""
          });
        } else {
          console.log("theres no header but a modal, create it");
          newHeader = jQuery('<div/>', {
            id: slide.headerId.split("#")[1],// + "_" + content.audio + "_" + (content.second || 0),
            class : "modal-header",
          }); //.appendTo(slide.container); //+ ' > .modal-dialog > .modal-content');

          xButton = jQuery('<button/>', {
            id: "xbtn_" + slide.headerId.split("#")[1],// + "_" + content.audio + "_" + (content.second || 0),
            class : "close",
            type : "button",
            "data-dismiss" : "modal",
            "aria-hidden" : true,
            //"disabled" : true,
            html : "x"
          }).appendTo(newHeader);

          newTitle = jQuery('<h4/>', {
            id: "title_" + slide.headerId.split("#")[1],// + "_" + content.audio + "_" + (content.second || 0),
            class: "modal-title",
            //id: element.id + "_label",
            html: content.name
          }).appendTo(newHeader);

          xButton.on('click', function(e){
            //closeModal();
            console.log("close the modal");
          });
        }
        
/*
        newTitle = jQuery('<h3/>',{
          //TODO: find automatically generated title id/index
          "id": "slideTitle",
          "class": "text-center " + classes,
          html: content.title.html || ""
        });
*/

        if(headerElement && headerElement.length > 0){
          headerElement.replaceWith(newHeader);
          console.log("replace the header");
        } else {
          console.log("append the header");
          console.log(newHeader);
          console.log(parent);
          newHeader.appendTo(parent);
        }
      }

      if(content.title && content.title.action && headerElement){
        switch(content.title.action){
          case "remove":
            headerElement.remove();
            break;
        }
      } else if(clearTitle){
        headerElement.remove();
      }

      if(setupContent && typeof setupContent === 'function'){
        setupContent(bsSize, callback);
      }

    });
  },

  // method for invoking all build functions in one place and activating the slide
  buildSlide: function(){
    "use strict";

    // console.log("inside buildSlide");

    var slide = this; //callback = function(){

    if(!this.options.noAudio){
      // console.log("going to buildSlideAudios");
      this.buildSlideAudios( );
    } else {
      // console.log("going to buildContent");
      this.buildContent(true, this.activeIndex, this.activeIndex, false, callback);
    }
    // console.log("callback from buildSlide!");
    slide.initAudioEvents( );

    //slide.buildFooter();

    slide.buildModals();

    // create events for audio/video interactions and a way to track them
    // console.log("now reset slide");

    if(!slide.options.noAudio){
      slide.resetSlide();  
    }
  
    // finished thus activate the slide
    slide.activateSlide();
    //this.buildFooter();

  },

  // method for building avatars into the slide
  buildAvatars: function(parent, avatar, callback){
    "use strict";
    // callback will generate the title+content
    var avatarLeft = "", avatarRight = "", contentClass = 12, i, slide = this;

//    console.log("buidling avatars");

    function createAvatars( avatars ){
      var avatarSide = "", avatarClass = "", avatarDiv = "", avatarElement, tempImg, filename = "";

      //console.log("AVATARS *** ");
      //console.log(avatars);

      for(i = 0; i < avatars.length; i++){

        if(avatars[i] !== ""){

          if(i === 0){
            avatarSide = "Left";
            avatarClass = "pull-left";
            
          }

          if(i === 1){
            avatarSide = "Right";
            avatarClass = "pull-right";

          }

          avatarDiv = $("#avatar" + avatarSide + "Div");
          
          if(!avatarDiv || avatarDiv.length < 1){
            avatarDiv = jQuery('<div/>', {
              id: "avatar" + avatarSide + "Div",
              "class": "avatar col-lg-2 " + avatarClass + " " + avatars[i].character,
            });
            
            i === 0 ? avatarDiv.prependTo(parent.parent()) : avatarDiv.appendTo(parent.parent()) ; 
          }

          if(slide.avatars && slide.avatars[avatars[i].character]){
            for(avatarElement in slide.avatars[avatars[i].character]){
              if(slide.avatars[avatars[i].character].hasOwnProperty(avatarElement)){
                tempImg = $("#" + avatars[i].character + "_" + avatarElement);

                if(!tempImg || tempImg.length < 1){
                  if(slide.options.development){
                    filename = "https:" + slide.avatars[avatars[i].character][avatarElement];
                  } else {
                    filename = slide.avatars[avatars[i].character][avatarElement];
                  }
                    if(avatarElement === avatars[i].type){
                      // make this one visible
                      jQuery('<img/>',{
                        id: avatars[i].character + "_" + avatarElement,
                        "class": "img-responsive avatar" + avatarSide,
                        src: filename
                      }).appendTo(avatarDiv);
                    } else {
                      // make the rest hidden
                      jQuery('<img/>',{
                        id: avatars[i].character + "_" + avatarElement,
                        "class": "img-responsive avatar" + avatarSide,
                        "css" : {
                          "display" : "none"
                        },
                        src: filename
                      }).appendTo(avatarDiv);
                    }
                } else {
                  // switch between hiding/showing the proper avatar type
                  if(avatarElement === avatars[i].type){
                    $("#" + avatars[i].character + "_" + avatarElement).show();
                  } else {
                    $("#" + avatars[i].character + "_" + avatarElement).hide();
                  }
                }
              }
            }
          }
        }
      }
    }

    if(this.options.showAvatars && avatar && avatar.length > 0){
      for(i = 0; i < avatar.length; i++){
        if(avatar[i].position === "left"){
          avatarLeft = avatar[i];
          contentClass -= 2;
        } else if(avatar[i].position === "right"){
          avatarRight = avatar[i];
          contentClass -= 2;
        } 
      }

      /*
      if(avatarLeft && avatarLeft !== ""){
        avatarArray.push(avatarLeft);
      }

      if(avatarRight && avatarRight !== ""){
        avatarArray.push(avatarRight);
      }
      */
      createAvatars( [ avatarLeft, avatarRight] );
    }

    if(callback && typeof callback === "function" ){
      callback(contentClass);
    }
  },

  // method for building the content of the slide
  buildContent: function(correctAudio, index, outerIndex, clearContent, cb){
    "use strict";
    var outerSlideContent = this.slideContent, checkSlideHighlights = this.checkSlideHighlights, slide = this,
        activeIndex = index || this.activeIndex, contentContainer = $(this.container + " > .cdot_contentText"), setupInnerContent;

    outerIndex = this.activeIndex || 0;

    // console.log("whats the container here?");
    // console.log(contentContainer);
    // console.log("and the modal option?");
    // console.log(this.options.isModal);

    if( !this.options.isModal && (!contentContainer || contentContainer.length === 0) ){
      // console.log("first if");
      contentContainer = jQuery('<div/>', {
        "class": this.options.showAvatars ? "cdot_contentText col-lg-8" : "cdot_contentText col-xs-12"
      }).appendTo(this.container);
    } else if (this.options.isModal) {
      var dialogContainer = jQuery('<div/>', {
        "class": "modal-dialog modal-cdot"
      }).appendTo(this.container);

      contentContainer = jQuery('<div/>', {
        class: "modal-content"
      }).appendTo(dialogContainer);
      //contentContainer = $(this.container);
    }
    
    // console.log("and the contentainer after?");
    // console.log(contentContainer);

    this.buildHighlights(activeIndex);

    setupInnerContent = function(classSize, callback){
      var closingTag = "", src = "", slideContent = outerSlideContent[activeIndex], slideInner = $(slide.container + " > .cdot_contentText > .slideInner"), 
          action, contentClasses = "", imageClasses = "", bsClass = classSize || 12, innerContent, innerImage,
          newSlideInner;// callback = c;b

      if(!clearContent){
        if(slideContent.content){
          action = slideContent.content.action || "replace";
        } else {
          action = "replace";
        }

        // lets take care of our highlights
        checkSlideHighlights(slideContent.highlights, slide);

        newSlideInner = jQuery('<div/>', {
          id: "slideInner_" + outerIndex,
          "class": "slideInner col-xs-12" + (slide.options.isModal ? " modal-body" : ""),
        });

        if (slideContent.content && slideContent.content.html){
          if(slideContent.content.classes){
            contentClasses = slideContent.content.classes.join(" ");
          }

          innerContent = jQuery('<div/>',{
            id: "innerContent_" + outerIndex + "_" + activeIndex,
            "class": contentClasses,
            html: slideContent.content.html || ""
          });
        } 


        // console.log("is there an inner image here?");
        if (slideContent.image && slideContent.image.src) {
          if(slideContent.image.classes){
            imageClasses = slideContent.image.classes.join(" ");
          }

          innerImage = jQuery('<img/>',{
            id: "innerImage_" + outerIndex + "_" + activeIndex,
            "class": imageClasses,
            src: slideContent.image.src || ""
          });

          // console.log("inner image is: ");
          // console.log(innerImage);
        }

        console.log("the inner elemnt is...");
        console.log(slideInner);

        if(action === "remove" || action === "replace"){
          // console.log("removing");
          //$(".slideInner").children().remove();
          slideInner.children().remove();
          slideInner.remove();
          //$(".slideInner").remove();
        }

        if(action === "append" || action === "replace"){
          // console.log("appending");
          if(innerContent){
            innerContent.appendTo(newSlideInner);
          }
          if(innerImage){
            innerImage.appendTo(newSlideInner);
          }
          newSlideInner.appendTo(contentContainer);
        }
      } else {
        slideInner.children().remove();
        //$(".slideInner").children().remove();
      }

      //if(call && typeof cb === 'function'){
        //cb();
      //}

      if(callback && typeof callback === 'function'){
        callback();
      }
      
      slide.buildFooter();

    };

    if ( (!this.slideContent[activeIndex].second && !this.slideContent[activeIndex].audio) || correctAudio ){
      this.buildHeader( contentContainer, this.slideContent[activeIndex], setupInnerContent, false, cb);
    } else if ( clearContent ){
      this.buildHeader( contentContainer, this.slideContent[activeIndex], setupInnerContent, clearContent, cb);
    }
    
  },

  buildFooter: function(){
    "use strict";

    var footer = $(this.options.footerId);

    // console.log("inside footer");


    if(!footer || footer.length < 1){

      footer = jQuery('<div/>', {
        id: this.options.footerId.split("#")[1],
        class: this.options.isModal ? "modal-footer" : "row"
      });

      if(this.options.isModal){
         console.log("trying to find container");
        footer.appendTo( this.container + " > .modal-dialog > .modal-content");
         console.log( $(this.container + " > .modal-dialog > .modal-content") );
      } else {
        footer.appendTo( $(this.container).parent() );  
      }

      // console.log("trying to append footer to " + this.container);
      console.log("wheres the footer");
      console.log(footer);
      // console.log("launching build controls");
      
      this.buildSlideControls(footer);
      
      // console.log("launching build course controls");
      
      this.buildCourseControls(footer);

    }


  },

  // build controls that go immediately after the slide (play/pause buttons)
  buildSlideControls: function(parentContainer){
    "use strict";

    var parent = parentContainer || $(this.container).parent();

    if(this.options.showSlideControls){
      var slideControlsRow = jQuery('<div/>', {
        "class": "row",
      }).appendTo( parent );

      this.insertLineBreak(slideControlsRow);

      var slideControlsContainer = jQuery('<div/>', {
        "id": "playerControls",
      }).appendTo(slideControlsRow);

      var slideControlsPrevious = jQuery('<div/>', {
        "id": "btnPDiv",
        html: '<a href="#" id="btnP" class="btn btn-default cdotBtn2" disabled role="button"></a>'
      }).appendTo(slideControlsContainer);

      var slideControlsPlay = jQuery('<div/>', {
        "id": "btnPlayDiv",
        html: '<a id="btnPlay" class="btn btn-default cdotBtn2" role="button"></a>' +
              '<a id="btnPause" class="btn btn-default cdotBtn2" role="button"></a>' +
              '<a id="btnR" class="btn btn-default cdotBtn2" role="button"></a>'
      }).appendTo(slideControlsContainer);

      var slideControlsNext = jQuery('<div/>', {
        "id": "btnNDiv",
        html: '<a href="#" id="btnN" class="btn btn-default cdotBtn2" disabled role="button"></a>'
      }).appendTo(slideControlsContainer);

      this.slideElements.slideControls = {
        previous: $("#btnP").data("action", "previous"),
        play: $("#btnPlay").data("action", "play"),
        pause: $("#btnPause").data("action", "pause"),
        replay: $("#btnR").data("action", "replay"),
        next: $("#btnN").data("action", "next")
      };

      this.insertLineBreak(slideControlsRow);

      this.initSlideButtonEvents();
    } else {
      this.insertLineBreak( parent );
    }
  },

  insertLineBreak: function( parent ){
    "use strict";
    try {
      jQuery('<div/>', {
        "class": "col-xs-12",
        html: "<!----><br/>"
      }).appendTo(parent);
    } catch(error) {
      console.log("error: " + error);
      console.log("no parent provided, line break not added");
    }
  },

  buildSlideAudios: function(){//modalAudios, parent, modalIndex){
    "use strict";
    var slideObject = this, localAudios, parentContainer;
 
    // check hasPlayer parameter if has been loaded/listend to previously
    // and if matches the # of audioFiles... if so set var to true and restrict pushing hasListened

    if(this.audioFiles){ //|| (modalAudios && parent) ){
      localAudios = this.audioFiles; // modalAudios
      parentContainer = slideObject.container;

      // if modals, 2d array thus two itterations...
      localAudios.forEach( function(audio, a){
        // lets make sure that the filename provided is without the extension
        var split = audio.split("."), filename = "", tempArray = [], addedSlideAudio, source, 
            extensions = [".mp3", ".wav", ".ogg"], types = [ "audio/mpeg", "audio/wav", "audio/ogg"], i;

        // console.log("audio files here: " + audio); 

        // make into a function ?
        try{
          // checking to make sure that the filename given is without an extension
          if(split.length === 2){
            // take only the first argument
            filename = split[0];
          } else if(split.length > 2){
            // lets join everything except for the extension
            for(i = 0; i < split.length-1; i++){
              tempArray.push(split[i]);
            }

            if(slideObject.options.development){
              filename = "https:" + tempArray.join(".");
            } else {
              filename = tempArray.join(".");
            }
          } else {
            // its probably the actual filename alone
            filename = audio;
          }
        } catch(error){
          console.log("error: " + error);
          console.log("error while trying to parse audio filename");
        }

        addedSlideAudio = jQuery('<audio/>',{
          id: "audio_" + a,
          html: "Your browser doesn't support audio"
        }).appendTo(parentContainer);

        for(i=0; i<extensions.length; i++){
          source = jQuery('<source/>', {
            src: filename + extensions[i],
            type: types[i]
          }).appendTo(addedSlideAudio);
        }
/*
        if(modalAudios && parent){
          try {
            slideObject.modalData[modalIndex].modalAudios.push(Popcorn("#audio_" + a));
            slideObject.modalData[modalIndex].modalHasListened.push(false);
          } catch(error) {
            // was popcorn initialized ok?
            console.log("modal audio init error: ");
            console.log(error);
          }
        } else {
*/
          try {
            slideObject.slideAudios.push(Popcorn("#audio_" + a));
            slideObject.slideHasListened.push(false);
          } catch(error) {
            // was popcorn initialized ok?
            console.log("slide audio init error: ");
            console.log(error);
          }
//        }
      });
    }
  },

  buildStatusBar: function(parent){
    "use strict";
    if(this.options.showStatus){
      var closeButton, 

      statusBar = jQuery('<div/>', {
        "class": "col-xs-12",
        html: '<a href="#" id="' + this.statusId.split("#")[1] + '"' + 
              'class="btn btn-default col-xs-offset-1 col-xs-10 col-sm-offset-2 col-sm-8 text-center" ' +
              'role="button">Slide Loading...</a>'
      }).appendTo(parent);

      if(this.options.isModal){
        this.insertLineBreak(parent);

        closeButton = jQuery('<button/>', {
          type: "button",
          class: "btn btn-default",
          'data-dismiss': "modal",
          html: "Back to Instruments"
        }).appendTo(parent);
        
      }

      // console.log("trying to see if statusBar exists");
      this.slideElements.statusBar = statusBar.find(this.statusId);//$(this.statusId);
      // console.log(this.slideElements.statusBar);
      //this.slideElements.statusBar = $("#statusBar");
    }
  },

  // builds controls that go at the very bottom of the slide (back/continue) and status bar
  buildCourseControls: function(parentContainer){
    var controls = $(this.options.footerId + " .controls"), parent = parentContainer || $(this.container).parent();

    if(this.options.showControls){ //&& (!controls || controls.length < 1) ){
      var courseControlsRow = jQuery('<div/>', {
        "class": "row controls",
      }).appendTo( parent );

      this.buildStatusBar(courseControlsRow);

      this.insertLineBreak(courseControlsRow);

      // TODO: make titles of buttons editable by allowing them to be a property inside options
      var courseControlsContainer = jQuery('<div/>', {
        "class": "col-xs-12",
        html: '<a href="#" id="btnB" class="btn btn-default col-xs-6 col-sm-4" role="button">&lt; Back</a>' + 
              '<a href="#" id="btnC" class="btn btn-default col-xs-6 col-sm-offset-4 col-sm-4" role="button">Continue &gt;</a>'
      }).appendTo(courseControlsRow);

      this.slideElements.courseControls = {
        back: $("#btnB").data("action", "back"),
        "continue": $("#btnC").data("action", "continue")
      };

    } else {
      //this.buildStatusBar( this.options.isModal ? parent : this.options.container);    
      // console.log("building only status bar ! on parent");
      // console.log(parent);
      this.buildStatusBar(parent);
    }
  },
  
  buildHighlights: function(index, modalHighlight){
    var slide = this, $highlight, modalInvoker, h, addOnClick = [];

    if(this.options.enableHighlights && this.highlights && this.highlights.length > 0){
      // console.log("lets build highlights");
      for(h = 0; h < this.highlights.length; h++){
        $highlight = $("#" + this.highlights[h].id + "_highlight");
        if( !$highlight || $highlight.length < 1 ){
          modalInvoker = jQuery('<div/>', {
              id: this.highlights[h].id + "_highlight",
              href : "#modal_" + this.highlights[h].id,
              role : "button",
              "class" : "clearClickable",
              'data-toggle': "modal",
              style: "top:" + this.highlights[h].top + 
                     ";left:" + this.highlights[h].left +
                     ";width:" + this.highlights[h].width +
                     ";height:" + this.highlights[h].height +
                     (slide.options.hiddenHighlights ? ";cursor:default" : (";border:" + this.highlights[h].border + ";cursor:pointer") ) + 
                     ";position:absolute" + 
                     ";display:none;z-index:1;"
          }).appendTo(slide.container + " > .cdot_contentText");            

          slide.slideElements.highlightElements.push(modalInvoker);
          addOnClick.push(false);
        }
      }

      if(slide.slideContent[index].highlights){
        // now lets add on clicks on the modals we need them in
        for(h=0; h<slide.slideContent[index].highlights.length; h++){
          if(typeof slide.slideContent[index].highlights[h] === "object" && 
              slide.slideContent[index].highlights[h].onclick &&
              typeof slide.slideContent[index].highlights[h].onclick === "function"){
            addOnClick[slide.slideContent[index].highlights[h].index] = slide.slideContent[index].highlights[h].onclick;
          }
        }

        for(h=0; h<addOnClick.length; h++){
          if(addOnClick[h]){
            slide.slideElements.highlightElements[h]
              .off();
            slide.slideElements.highlightElements[h]
              .on("click", addOnClick[h]);
          } else {
            slide.slideElements.highlightElements[h].off();
          }
        }
      }

    }

  },

  buildModals: function(modalOptions){
    var newModal;
    // modals are basically slides with an extra option
    // build constrained inside a modal window
    if(this.options.enableModals && this.options.enableHighlights){
      for(i = 0; i < this.modals.length; i++){
        newModalElement = jQuery('<div/>', {
            id: "modal_" + this.modals[i].id,
            class : "modal fade",
            "tab-index" : "-1",
            role: "dialog",
            "aria-labelledby" : this.modals[i].id + "_label",
            "aria-hidden" : true,
            "data-backdrop": "static",
            "data-keyboard": false
        }).appendTo(this.container);

        newModal = new AVIATION.common.Slide({
               showAvatars: false,
               showSlideControls: false,
               showStatus: true,
               showControls: false,
               development: true,
               isModal: true,
               container: "#modal_" + this.modals[i].id,
               statusId: "#modal_status_" + this.modals[i].id,
               headerId: "#modal_header_" + this.modals[i].id,
               footerId: "#modal_footer_" + this.modals[i].id
             },
             [{
               title: { html: "This is the first title that appears" },
               content: { html: "This is the html inside the slide <b>that can be used</b>" },
               audio: 0
             }],
             [ 
               "//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_Slide2_Tom.mp3" // no extension necessary
               // all of the possible audio extensions will be created automatically
             ]);

        console.log("this is the modal slide: ");
        console.log(newModal);

        newModal.constructor();

        this.modalSlides.push(newModal);  
      }
      // itirate through modals and create each one with a unique id and launch the 
      // build content with the modified this.container id so that content gets appended to the modal
      // how do we handle audio though?
    }
  },
  
  resetStatusBar: function(){
    // console.log("resetting status bar");
    this.slideElements.statusBar.off();
    this.slideElements.statusBar.prop("disabled", true);
  },

  activateTimer: function(seconds, isAuto){
    var timer = this._timer, slideObject = this, continueId = this.options.continueId,
        counter = seconds || 5, // duration of the timer (each 1 point is about a second)
        statusBar = this.slideElements.statusBar;

    if (!timer){
      this._timer = "";
      timer = this._timer;
    }

    var resetTimerOnClick = function(e){
      e.preventDefault();
      // console.log("clicked reset on status bar");
      slideObject.resetTimer(true);
      if(continueId && continueId !== ""){
        $(this).on('click', function(){
          slideObject.redirectToPage(continueId); // any URL
        });
      }
    };

    // enable the status bar because we need to accept clicks
    statusBar.prop("disabled", false);

    statusBar.on('click', resetTimerOnClick);
  
    if(isAuto) {
      statusBar.text("Continuing in " + counter.toString() + "... Click here to cancel");
    
      this._timer = setInterval( function(){
          counter--;
          if(counter < 0) {
            clearInterval(slideObject._timer);
            
            if(continueId && continueId !== ""){
              slideObject.redirectToPage(continueId);
              statusBar.text("Redirecting...");
            } else {
              statusBar.text("Error: continueId is undefined");
            }
          } else {
            statusBar.text("Continuing in " + counter.toString() + "... Click here to cancel");
          }
      }, 1000);
    } else {
      this._timer = null;
    }
  },

  resetTimer: function( manual ){
    if(this._timer){
      if(manual){
        this.slideElements.statusBar.text("Continue when ready");
      }

      clearInterval(this._timer);
    }
  },

  playCurrent: function(e){
    var active = this.activeIndex, players = this.slideAudios;

    this.checkSlideControlPlayButtons("play");
    // console.log("playCurrent active: " + active);
    players[active].play();
    // console.log("trying to play...");
  },
  
  pauseCurrent: function(e){
    var active = this.activeIndex, players = this.slideAudios;
    
    this.checkSlideControlPlayButtons("pause");

    if(players[active]){
      players[active].pause();  
    }
  },

  playPrevious: function(e){
    this.resetStatusBar();

    this.pauseCurrent();

    this.resetAudio();

    this.activeIndex--;

    this.playCurrent();
  },

  playNext: function(e){
    this.pauseCurrent();

    this.resetAudio();

    this.activeIndex++;
    // console.log("playing next, whats the activeIndex now? " + this.activeIndex);
    this.playCurrent();
  },

  replayAll: function(e){
    this.resetStatusBar();

    this.resetSlide();

    this.playCurrent();
  },

  resetAudio: function(e){
    if(this.slideAudios[this.activeIndex]){
      this.slideAudios[this.activeIndex].currentTime(0);
    }
  },

  buttonOnClickEvents: function(){
    // check if there is a timer and reset if we click on a control button
    this.resetTimer();

  },

  initSlideButtonEvents: function(){
    // attach events to each button
    var buttons = this.slideElements.slideControls, slide = this;

    // console.log("slidebutton events slide: ");
    // console.log(slide);

    function initSlideBtn(e, button){
          var action = $(this).data("action");
          switch(action){

            case "previous":
              console.log("clicked previous");
              slide.resetTimer();
              slide.playPrevious();
              break;

            case "play":
              console.log("clicked play");
              slide.playCurrent();
              break;

            case "pause":
              console.log("clicked pause");
              slide.pauseCurrent();
              break;

            case "replay":
              console.log("clicked replay");
              slide.resetTimer();
              slide.replayAll();
              break;

            case "next":
              console.log("clicked next");
              slide.playNext();
              break;

            default: 
              console.log("not sure what this button is!");
              console.log(button);
              console.log(buttons[button]);
              break;
          }
        }

    for(var button in buttons){
      if(buttons.hasOwnProperty(button)){
        buttons[button].on("click", initSlideBtn);
      }
    }
  },

  initCourseButtonEvents: function(){
   // attach events to each button
    var buttons = this.slideElements.courseControls, slide = this;

    // console.log("coursebutton events slide: ");
    // console.log(slide);

    function assignBtnAction(e, button){
      var action = $(this).data("action");
      switch(action){
        case "back":
          redirectToPage(slide.options.backId);
          break;

        case "continue":
          redirectToPage(slide.options.continueId);
          break;

        default:
          break;
      }
    }

    for( var button in buttons){
      if(buttons.hasOwnProperty(button)){
        buttons[button].on("click", assignBtnAction);
      }
    }


  },
  
  initAudioEvents: function(callback){
    var players = this.slideAudios, content = this.slideContent, hasListened = this.slideHasListened,
        slideObject = this;
    // let's set the generic "onPlay/onEnd" events


    players.forEach(function(player, p){
      var contentAtStart = "", callbackAtEnd = "";

      content.forEach(function(cont, c){
        if(content[c].audio === p){
          if(content[c].second){
            players[p].cue(content[c].second, function(){
              slideObject.buildContent(true, c);
              if(content[c].callback){
                // run the callback that should be cued
                content[c].callback();
              }
            });
          } else {
            contentAtStart = c;

            if(content[c].callback && typeof content[c].callback === "function"){
              callbackAtEnd = content[c].callback;
              //callbackAtEnd();
            }

          }
        }
      });

      // force it to only happen at the beginning of the audio
      player.cue("0.1", function(){
        slideObject.buildContent(true, contentAtStart);
        if(callbackAtEnd){
          // run the callback that should be cued
          callbackAtEnd();
        }
      });

      players[p].on("ended", function(e){
        slideObject.checkSlideControlPlayButtonsState();

        if (callbackAtEnd !== ""){
          //callbackAtEnd();
        }
        
        // start the next audio if it exists and autoplay is true
        if(players[p+1] && this.autoplay){
          slideObject.playNext();
        }

        hasListened[p] = true;

        // if it is last audio and no need for audioFirst
        if(!players[p+1] && !slideObject.options.audioFirst){
          slideObject.activeIndex++;

          if(slideObject.options.autoplay){
            // only activate the timer if the autplay is on
            
            slideObject.activateTimer(5, true);  
          } else {
            slideObject.statusBar.html('Click "Continue" when you are ready');
          }
          
          slideObject.checkSlideControlPlayButtons("end");
        }
        
      });

      players[p].on("playing", function(e){
        // something that happens every time we press play (avatar opens mouth?)
        console.log("starting playing audio");
      });

      players[p].on("pause", function(e){
        console.log("has been paused...");
      });

    });

    this.buildFooter();
    //this.buildContent(true, this.activeIndex);
    // if no audio?
  },

  checkSlideControlPlayButtons: function( action ){
    var controls = this.slideElements.slideControls;

    if(this.options.showSlideControls){
      switch(action) {
        // hide/show buttons based on action
        case "play":
          controls.play.hide();
          controls.replay.hide();
          controls.pause.show();
          break;
        case "pause":
          controls.play.show();
          controls.replay.hide();
          controls.pause.hide();
          break;
        case "replay":
          controls.play.hide();
          controls.replay.hide();
          controls.pause.show();
          break;
        case "end":
          controls.play.hide();
          controls.replay.show();
          controls.pause.hide(); 
          break;
        default:
          this.slideElements.slideControls.pause.hide();
          this.slideElements.slideControls.replay.hide();
          break;
      }

    }

    this.checkSlideControlPlayButtonsState();

    this.setStatus(action);
  },

  // constrols the state of the Previous/Next 'player' buttons
  checkSlideControlPlayButtonsState: function(){
    var controls = this.slideElements.slideControls, active = this.activeIndex,
        players = this.slideAudios;

    if(this.options.showSlideControls){

      if(active < 1){
        console.log("first audio, no way back");
        controls.previous.prop("disabled", true);
        controls.previous.attr("disabled", true);
        if(this.slideHasListened[active]){
          controls.next.prop("disabled", false);
          controls.next.removeAttr("disabled");
        }
      } else {
        if (active < players.length - 1){
          console.log("active is before the last player");
          controls.previous.prop("disabled", false);
          controls.previous.removeAttr("disabled");
          if(this.slideHasListened[active]){
            controls.next.prop("disabled", false);
            controls.next.removeAttr("disabled");
          } else {
            controls.next.prop("disabled", true);
            controls.next.attr("disabled", true);
          }
        } else if (active === players.length - 1){
          console.log("active is the last players length");
          controls.previous.prop("disabled", false);
          controls.previous.removeAttr("disabled");
          controls.next.attr("disabled", true);
          controls.next.prop("disabled", true);
        } else {
          console.log("error: active is greater then players length? not doing anything");
        }
      }

    }

  },

  // controls the state (enabled/disabled) of the Back/Continue buttons
  checkSlideControlNavButtons: function( action ){

  },

  setStatus: function(action){
    var status = this.slideElements.statusBar;

    switch(action){
      case "play":
      case "replay":
        status.text("Playing...");
        break;
      case "pause":
        status.text("Paused");
        break;
      case "end":
        break;
      default:
        if(action){
          status.text(action);
        } else {
          status.text("Status is undefined!");
        }
        
        break;      
    }
  },

  activateSlide: function(){
    if(!this.options.noAudio && !this.options.isModal){
      this.playCurrent();  
    }
  },

  resetSlide: function(){

    this.activeIndex = 0;
    // console.log(this.slideElements.slideControls);
    this.checkSlideControlPlayButtons();

    if(this.options.noAudio){
      this.setStatus('Press "Continue" when ready');
    }

    //this.buildContent(null, null, null, true);
  },

  redirectToPage: function( pageId ){
    var current = window.location.href, newUrl, tempSplit, splitter;

    splitter = "courseware";

    tempSplit = current.split(splitter);
          
    newUrl = tempSplit[0];
    window.location.assign(newUrl + "jump_to_id/" + pageId);
  },

  initDefaults: function(options){
    "use strict";
    var avatars, content = [], audio = [],
        defaults = {
          showAvatars: false,
          showSlideControls: true,
          showStatus: true,
          showControls: true,
          showBorder: true,
          autoplay: true,
          noAudio: false,
          enableModals: false,
          enableHighlights: false,
          hiddenHighlights: false,
          headerId: "#slideHeader",
          footerId: "#slideFooter",
          avatars: {
            tom: {
              open: "//online.cdot.senecacollege.ca:25080/aviation/img/tomOpen.png",
              close: "//online.cdot.senecacollege.ca:25080/aviation/img/tomClose.png"
            },
            jane: {
              open: "//online.cdot.senecacollege.ca:25080/aviation/img/janeOpen.png",
              close: "//online.cdot.senecacollege.ca:25080/aviation/img/janeClose.png"
            }
          },
          continueId: "1970850cff004914997ec29c65850443",
          highlights: 
          [
            { // #1
              id: "ai",
              orderNumber: 0,
              name: "Attitude Indicator (AI)",
              // image: "//online.cdot.senecacollege.ca/c4x/Seneca_College/M01S01_Test/asset/attitudeIndicator_wBg.png",
              // audio: [ "//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_Slide2_Tom.mp3" ],
              // modalAudio: ["//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_ClickHighlights_Tom.mp3"],
              top : "5%",
              left : "36.2%",
              width : "26%",
              height: "41%",
              border : "7px ridge yellow",
            }, 
            { // #2
              id: "alt",
              orderNumber: 1,
              name: "Altimeter (ALT)",
              // image: "//online.cdot.senecacollege.ca/c4x/Seneca_College/M01S01_Test/asset/altimeter_wBg.png",
              // audio: [ "//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_Slide4_Jane.mp3" ],
              // modalAudio: ["//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_ClickHighlights_Jane.mp3"],
              top : "5%",
              left : "62%",
              width : "26%",
              height: "41%",
              border : "7px ridge yellow",                            
            },
            { // #3
              id: "hi",
              orderNumber: 2,
              name: "Heading Indicator (HI)",
              // image: "//online.cdot.senecacollege.ca/c4x/Seneca_College/M01S01_Test/asset/headingIndicator_wBg.png",
              // audio: [ "//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_Slide7_Tom.mp3" ],
              // modalAudio: ["//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_ClickHighlights_Tom.mp3"],
              top : "50%",
              left : "36.2%",
              width : "26%",
              height: "41%",
              border : "7px ridge yellow",                            
            },
            { // #4
              id: "asi",
              orderNumber: 3,
              name: "Airspeed Indicator (ASI)",
              // image: "//online.cdot.senecacollege.ca/c4x/Seneca_College/M01S01_Test/asset/airspeedIndicator_wBg.png",
              // audio: [ "//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_Slide9_Jane.mp3" ],
              // modalAudio: ["//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_ClickHighlights_Jane.mp3"],
              top : "5%",
              left : "10.5%",
              width : "26%",
              height: "41%",
              border : "7px ridge yellow",                            
            },
            { // #5
              id: "vsi",
              orderNumber: 4,
              name: "Vertical Speed Indicator (VSI)",
              //image: "//online.cdot.senecacollege.ca/c4x/Seneca_College/M01S01_Test/asset/verticalSpeedIndicator_wBg.png",
              //audio: [ "//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_Slide11_Tom.mp3" ],
              //modalAudio: ["//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_ClickHighlights_Tom.mp3"],
              top: "50%",
              left: "62%",
              width: "26%",
              height: "41%",
              border : "7px ridge yellow",
            },
            { // #6
              id: "tc",
              orderNumber: 5,
              name: "Turn Coordinator (TC)",
              //image: "//online.cdot.senecacollege.ca/c4x/Seneca_College/M01S01_Test/asset/turnCoordinator_wBg.png",
              //audio: [ "//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_Slide14_Jane.mp3" ],
              //modalAudio: ["//online.cdot.senecacollege.ca:25080/aviation/audios/M01S02_ClickHighlights_Jane.mp3"],
              top : "50%",
              left : "10.5%",
              width : "26%",
              height: "41%",
              border : "7px ridge yellow",                            
              },
          ]}, option;

    if(!options){
      options = this.options || {};
    }

    for(option in defaults){
      if(defaults.hasOwnProperty(option)){
        // if this key doesn't exist, init to default
        if(typeof options[option] === 'undefined'){
             options[option] = defaults[option];
        }
      }
    }

    // a way to keep track of the modals on the page
    this.modalSlides = [];

    // TODO: move this when neccessary, for testing and development only
    this.slideElements.highlightElements = [];

    this.avatars = options.avatars;
    this.highlights = options.highlights;
    this.modals = options.modals || [];
    this.options = options;

    this.container = options.container || "#slideContainer";
    this.statusId = options.statusId || "#statusBar";
    this.headerId = options.headerId || "#header";
    this.footerId = options.footerId || "#footer";
    this.bodyId = options.bodyId || "#body";

    /* error handling example
    try {
      // if smth might cause an error....
      if(!this.container){
        throw "a container is required, thus provide an id";
      }
    } catch(error){
      console.log("error: ");
      console.debug(error);
      console.log("using a default id instead");
      // do something to continue running
      this.container = "#slideContainer"
    };
    */
  },

  checkSlideHighlights: function( showHighlights, slide ){
    "use strict";
    var i, j, toShow = [];
    if(showHighlights && showHighlights.length > 0){
      // check the index/indices of highlights to show from the bank
      // and hide/show accordingly
      // console.log("lets manage some highlights!");
      for(i=0; slide.highlights && i < slide.highlights.length; i++){
        toShow.push(false);
      }

      for(j=0; showHighlights && j < showHighlights.length; j++){
        if(typeof showHighlights[j] === "object"){
          toShow[showHighlights[j].index] = true;
        } else {
          toShow[showHighlights[j]] = true;  
        }
      }

      for(i=0; i < toShow.length; i++){
        if(toShow[i]){
          slide.slideElements.highlightElements[i].show();
        } else {
          slide.slideElements.highlightElements[i].hide();
        }
      }
    }

  }
};
console.log("testing this class execution");