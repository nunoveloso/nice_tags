/**
 * @file
 * JS file of nice tag module, for the admin page admin/content/taxonomy/edit/vocabulary/$VID
 * 
 * @author Nuno Veloso (drupal.org/user/80656) 
 */


/**
 * Using Drupal behaviours to declare main function
 */
Drupal.behaviors.nice_tags_admin = function() {

  // indents and hides the checkbox
  $('#edit-nice-tags-wrapper').css('margin-left', '20px');

  // binds click action to tags checkbox
  $('#edit-tags-wrapper').find('input').click(niceTagsAdmin);

  // also sets the default state of the nice tags checkbox
  niceTagsAdmin();


  /**
   * This functions simply shows or hides the nice tag check box when it makes sense
   */
  function niceTagsAdmin() {
    $tags_checkbox = $('#edit-tags-wrapper').find('input');
    $nice_tags_wrapper = $('#edit-nice-tags-wrapper');

    if ($tags_checkbox.is(":checked")) {
        $nice_tags_wrapper.show('slow');
    }
    else {
        $nice_tags_wrapper.hide('slow');
    }
  }
}
