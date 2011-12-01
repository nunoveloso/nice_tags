/**
 * @file
 * JS file of nice tag module, does all the job
 * 
 * @author Nuno Veloso (drupal.org/user/80656) 
 */


/**
 * Using Drupal behaviours to declare main function
 */
Drupal.behaviors.nice_tags = function() {
  $.each(Drupal.settings['nice_tags'], function(index, input_wrapper) {
    
    // if this form hasn't been processed already
    if (!$(input_wrapper).hasClass('nice-tags-processed')) {
      // initalises nice tags environment
      tagsStateInit(input_wrapper);

      // prepopulates tagsState
      tagsStatePrepoulate(input_wrapper);

      // handles the triggers and listeners
      easyTagsListen(input_wrapper)

      // this is to prevent multi call
      $(input_wrapper).addClass('nice-tags-processed');
    }

    /**
     * Overriding AutoComplete method that Hides the autocomplete suggestions
     *
     * note: using this rather than Drupal.jsAC.prototype.select so it works with both key and click event
     */
    Drupal.jsAC.prototype.hidePopup = function (keycode) {
      var input_wrapper = '#' + $(this.input).parent().parent().parent().attr('id');

      // Select item if the right key or mousebutton was pressed
      if (this.selected && ((keycode && keycode != 46 && keycode != 8 && keycode != 27) || !keycode)) {
        tagsStateAdd(this.selected.autocompleteValue, input_wrapper);
        this.input.value = '';
      }
      // Hide popup
      var popup = this.popup;
      if (popup) {
        this.popup = null;
        $(popup).fadeOut('fast', function() { $(popup).remove(); });
      }
      this.selected = false;
    };


    /**
     * Prepares form for nice tag and initialises tagState space
     *
     * @param input wrapper id
     *
     * @todo move theme stuff to Drupal theme prototype?
     */
    function tagsStateInit(input_wrapper) {
      // Clone the original form and make sure we distinguish them
      $(input_wrapper).prepend($(input_wrapper).html());
      $(input_wrapper).children('.form-item:first').addClass('nice-tags-form-item');
      $(input_wrapper).children('.form-item:last').addClass('regular-form-item').hide();
      // make it easy to flush style
      $(input_wrapper).append('<div class="clear"></div>');
      // add tags container
      $(input_wrapper).children('.nice-tags-form-item').find('input').wrap('<div class="tags-container"></div>');

      var $tagEditor = $(input_wrapper).children('.nice-tags-form-item'),
          $tagContainer = $tagEditor.find('.tags-container'),
          $inputField = $tagContainer.find('input');

      // on click, focus input field - this will allow to emulate the tags to be part of the input 
      $tagContainer.click(function(){
        $inputField.focus();
        $(this).addClass('focus');
      });

      // remove the focus when input blur is fired
      $inputField.blur(function(){
        $tagContainer.removeClass('focus');
      });
    }


    /**
     * Prepopulates the tag container
     *
     * @param input wrapper id
     */
    function tagsStatePrepoulate(input_wrapper) {
      var $tagEditor = $(input_wrapper).children('.nice-tags-form-item'),
          $tagContainer = $tagEditor.find('.tags-container'),
          $inputField = $tagContainer.find('input');

      // tags are empty, so let's make sure the array is too
      tags = $inputField.attr('value').split(',');

      // if there are tags present, display them
      if (tags.length > 0) {
        $.each(tags, function(index, tag) {
          tagsStateAdd(tag, input_wrapper);
        });
        $inputField.val('');
      }
    }


    /**
     * Adds event listeners to the easy tag form
     *
     * @param input wrapper id
     */
    function easyTagsListen(input_wrapper) {
      var $tagEditor = $(input_wrapper).children('.nice-tags-form-item'),
          $tagContainer = $tagEditor.find('.tags-container'),
          $inputField = $tagContainer.find('input');

      // key codes that trigger the tag to be added when pressed
      var keyTriggers = [
        9,    // tab
        13,   // return
        186,  // semi-colon
        188,  // comma
      ];

      // key event listener
      $inputField.keyup(function(e, keyCode){
        // gets the pressed key
        keyCode = keyCode || e.keyCode;

        // remove last tag if backspace is pressed and the form is empty
        if (keyCode == 8 && $inputField.val() == '') {
          $tagContainer.find('span:last').remove();
          tagStateRefresh(input_wrapper);
          $inputField.val('');
        }
        else {
          // gets the new inputed tag
          var tag = $inputField.val();

          // when pressing any trigger key, adds the new tag and clean up the field
          if ($.inArray(keyCode, keyTriggers) != -1 && $inputField.val() != '') {
            tagsStateAdd(tag, input_wrapper);
            $inputField.val('');
            // if contained in a form hitting return would submit the form, we want to avoid that.
            return false; 
          }
        }
      }).keydown(function(e) {
        // prevents tab and enter to perform their default action
        if (e.which == 9 || e.which == 13) {
        e.preventDefault();
        }
      });
    }


    /**
     * Adds a tag to the container
     *
     * @param input wrapper id
     *
     * @todo move theme stuff to Drupal theme prototype?
     */
    function tagsStateAdd(tag, input_wrapper) {
      var $tagEditor = $(input_wrapper).children('.nice-tags-form-item'),
          $tagContainer = $tagEditor.find('.tags-container'),
          $inputField = $tagContainer.find('input');

      var tagState = getTagsState(input_wrapper);

      // trims white spaces and prevents key triggers to be part of the tag
      tag = $.trim(tag).replace(/[,;]?$/, '');

      if (tag != '') {
        // checks if the tag has been added yet
        if ($.inArray(tag, tagState) == -1) {
          // prepare the tag html
          $newTag = $('<span class="tag">' + tag + '<a href="#nice-tags" title="remove tag">x</a></span>');

          // themes the tag and binds click event
          $newTag.insertBefore($inputField).find('a').click(function() {
             $(this).parent().remove();
             // if we remove the tag, we need to refresh the tagState
             tagStateRefresh(input_wrapper);
             $inputField.val('');
          });
        }
        tagStateRefresh(input_wrapper);
      }
    }


    /**
     * Refreshes the original tag field, the one that will actually be submitted
     *
     * @param input wrapper id
     */
    function tagStateRefresh(input_wrapper) {
      var $tagEditorRegular = $(input_wrapper).children('.regular-form-item'),
          $inputFieldRegular = $tagEditorRegular.find('input');

      $inputFieldRegular.val(getTagsState(input_wrapper).join(', '));
    }


    /**
     * Gets the tags state, which is an array with all the current values associated to the tag field
     *
     * @param input wrapper id
     */
    function getTagsState(input_wrapper) {
      var $tagEditor = $(input_wrapper).children('.nice-tags-form-item'),
          $tagContainer = $tagEditor.find('.tags-container'),
          $inputField = $tagContainer.find('input');
      var array = [];

      // builds the array, making sure only the raw term goes there
      $tagContainer.find('span').each(function (){
        array.push($(this).text().replace(/x$/, '').trim());
      });

      return array;
    }

  });
};


