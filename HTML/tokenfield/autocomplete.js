(function ($) {

var tf = termkit.tokenField;

/**
 * Autocomplete selection bubble for use with a token.
 */
tf.autocomplete = function (caret) {
  this.caret = caret;
  
  this.$element = this.$markup();
  this.items = [];
  this.prefix = '';
  this.selected = 0;
  this.token = null;
};

tf.autocomplete.prototype = {
  $markup: function () {
    var $popup = $('<span class="autocomplete"><span class="stretch"><span class="fill"></span><span class="lines"></span></span>').data('controller', this);
    var self = this;
    $popup;/*.find('input')
      .keydown(function (e) { self.onKeyDown(e); })
      .keypress(function (e) { self.onKeyPress(e); })
      .blur(function (e) { self.onBlur(); });*/
    return $popup;
  },

  attach: function () {
    // Clean up.
    this.remove();

    if (this.caret.selection == null) return;
    
    // Attach bubble.
    this.caret.$element.before(this.$element);
    
    // Extract prefix for autocompletion.
    this.token = this.caret.selection.anchor.token;
    this.prefix = this.token.contents.substring(0, this.caret.selection.anchor.offset);
    this.handler = this.token.autocomplete || (function () { });
  
    // Sync state.
    this.updateContents();
  },
  
  remove: function () {
    // Detach caret elements from document.
    this.$element.detach();
    this.items = [];
    this.prefix = '';
    this.selected = 0;
    this.token = null;
    
    // Reset caret position.
    //this.caret.$element.find('input').css('marginTop', 0);
    this.$element.css('marginTop', 0);
  },

  onBlur: function (element) {
    this.remove();
  },

  updateContents: function (event) {
    var tl = this.caret.tokenList, token = this.caret.selection.anchor.token;

    // Check if it's appropriate to display suggestions.
    // TODO

    // Get list of suggestions.
    this.items = this.handler && this.handler.call(this, tl.indexOf(token), event, tl.tokens) || [];

    // Insert lines into box.
    var prefix = this.prefix, $e = this.$element.find('.lines');
    $e.empty();
    $.each(this.items, function () {
      $e.append($('<span>').addClass("line").html('<span class="prefix">' + escapeText(prefix) +'</span><span>'+ escapeText(this) +'</span>'));
    });

    // Highlight active line, if any,
    if (this.items.length) {
      this.selected = (this.selected + this.items.length) % this.items.length;
      var $line = $($e.find('.line')[this.selected]);
      
      // Move caret element to active line.
      var offsetY = $line.addClass('active').position().top;
      //this.caret.$element.find('input').css('marginTop', offsetY);
      this.$element.animate({ 'marginTop': -offsetY }, { duration: 50 });

      $e.show();
    }
    else {
      $e.hide();
    }
  },
  
  onComplete: function (event) {
    if (this.token) {
      this.caret.setContents(this.prefix + this.items[this.selected], event);
      this.remove();
    }
  },
  
  onKeyDown: function (event) {
    // Intercept special keys
    switch (event.keyCode) {
      case 9: // TAB
      case 13: // Enter
        this.onComplete(event);
        event.preventDefault();
        event.stopPropagation();
        break;
      case 37: // Left arrow
        break;
      case 39: // Right arrow
        break;
      case 38: // Up arrow
        this.selected--;
        event.preventDefault();
        event.stopPropagation();
        break;
      case 40: // Down arrow
        this.selected++;
        event.preventDefault();
        event.stopPropagation();
        break;
    };
    
    this.keyCode = event.keyCode;
    this.charCode = 0;
    
    async.call(this, function () {
      this.updateContents(event);
    });
  },

  onKeyPress: function (event) {
    this.charCode = event.charCode;
  },

  reset: function () {
    // find caret offset inside textfield
    // calculate length of prefix
    // remove caret
    // insert caret at given pos
  },
  
};

})(jQuery);