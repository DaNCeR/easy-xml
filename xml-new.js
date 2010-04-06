(function(){
  var Document, Element, parseFromString, peek, stripWhitespace, sys, tokenize;
  var __extends = function(child, parent) {
    var ctor = function(){ };
    ctor.prototype = parent.prototype;
    child.__superClass__ = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
  };
  sys = require('sys');
  parseFromString = function parseFromString(xml) {
    var document, element, heirarchy, token, tokens;
    document = new Document();
    tokens = tokenize(xml);
    // this is an xml declaration
    tokens[0][1] === '?' ? (document.xmlDec = tokens.shift()) : null;
    // this is a DTD
    tokens[0][1] === '!' ? (document.docType = tokens.shift()) : null;
    // process root node and add it to document
    document.root = new Element(tokens.shift());
    tokens.pop();
    // create heirarchy stack to track what the next tokens parent is
    heirarchy = [];
    heirarchy.peek = peek;
    // add the root node to the stack
    heirarchy.push(document.root);
    while (tokens.length > 0) {
      // while there are still unprocessed tokens
      token = tokens.shift();
      // if the current token is a tag
      if (token[0] === '<') {
        // if this is a closing tag
        if (token[1] === '/') {
          // pop the current tag of the heirarchy
          heirarchy.pop();
        } else {
          // create an element from the token and add it to its parent
          element = new Element(token);
          sys.debug(sys.inspect(heirarchy.peek()));
          heirarchy.peek().push(element);
          // if the element isn't self closing add it to the heirarchy
          !token.match(/.*\/>/) ? heirarchy.push(element) : null;
        }
      } else {
        heirarchy.peek().push(token);
      }
    }
    return document;
  };
  stripWhitespace = function stripWhitespace(string) {
    return string.replace(/\s+</m, '<').replace(/>\s+/m, '>').replace(/\s+/m, ' ');
  };
  tokenize = function tokenize(xml) {
    var _a, stream, token;
    // strip whitespace from the xml and convert into an array of characters
    stream = stripWhitespace(xml).split('');
    _a = [];
    while (stream.length > 0) {
      _a.push((function() {
        token = '';
        token += stream.shift();
        // if the current token is a tag
        if (token === '<') {
          // add characters to the current token until the element stops
          while (stream[0] !== '>') {
            token += stream.shift();
          }
          return token += stream.shift();
        } else {
          // add characters to the current token until an element starts
          while (stream[0] !== '<') {
            token += stream.shift();
          }
          return token;
        }
      }).call(this));
    }
    return _a;
  };
  peek = function peek() {
    return this[this.length - 1];
  };
  Document = function Document() {  };
  Document.prototype.getElements = function getElements(selector) {
    var _a, _b, _c, element, elements, matches, token, tokens;
    tokens = selector.split(' ');
    elements = this.root.descendants();
    elements.push(this.root);
    while (tokens.length > 0) {
      token = tokens.shift();
      matches = [];
      _a = elements;
      for (_b = 0, _c = _a.length; _b < _c; _b++) {
        element = _a[_b];
        (function() {
          var _d, _e, _f, _g, child, children;
          children = element.descendants().filter(function(element) {
            return element.matchCSS(token);
          });
          _d = []; _e = children;
          for (_f = 0, _g = _e.length; _f < _g; _f++) {
            child = _e[_f];
            _d.push(matches.push(child));
          }
          return _d;
        }).call(this);
      }
      elements = matches;
    }
    return (elements.length > 0 ? elements : null);
  };
  Document.prototype.hasElement = function hasElement(selector) {
    return !!this.getElements(selector);
  };
  Element = function Element(tag) {
    var _a, _b, _c, attr, attrs, pair, tokens;
    Element.__superClass__.constructor.call(this);
    // grab the tag name and attributes
    tokens = tag.match(/<(\S+?)(?:\s(.*"))?(?:\s\/)?>/);
    this.tag = tokens[1];
    if (tokens[2]) {
      // split the attributes up
      attrs = tokens[2].match(/\S*?=".*?"/);
      _a = attrs;
      for (_b = 0, _c = _a.length; _b < _c; _b++) {
        attr = _a[_b];
        // for each attribute assign the value to this element
        pair = attr.match(/(\S*)="(.*)"/);
        this[pair[1]] = pair[2];
      }
    }
    return this;
  };
  __extends(Element, Array);
  Element.prototype.matchCSS = function matchCSS(selector) {
    var _a, _b, _c, tag, token, tokens;
    // this will split the selector up giving us an array with the tag and
    // all of the classes
    tokens = selector.split('.');
    tag = tokens.shift();
    // if the first token is a tag
    if (tag !== '') {
      // return false if it doesn't match this elements tag
      if (tag !== this.tag) {
        return false;
      }
      // for each class in the selector
    }
    _a = tokens;
    for (_b = 0, _c = _a.length; _b < _c; _b++) {
      token = _a[_b];
      // return false unless this element has the class
      if (!(this.hasClass(token))) {
        return false;
      }
      // otherwise return true
    }
    return true;
  };
  Element.prototype.hasClass = function hasClass(className) {
    var classes;
    // if this element doesn't have a class return false
    if (!this.class) {
      return false;
    }
    classes = this.class.split(/\s/);
    // return whether element has class
    return classes.indexOf(className) !== -1;
  };
  Element.prototype.descendants = function descendants() {
    var _a, _b, _c, _d, _e, _f, child, descendant, elements;
    elements = [];
    _a = this;
    for (_b = 0, _c = _a.length; _b < _c; _b++) {
      child = _a[_b];
      if (typeof child !== 'string') {
        elements.push(child);
        _d = child.descendants();
        for (_e = 0, _f = _d.length; _e < _f; _e++) {
          descendant = _d[_e];
          elements.push(descendant);
        }
      }
    }
    return elements;
  };
  // module API
  exports.parseFromString = parseFromString;
  exports.Element = Element;
})();
