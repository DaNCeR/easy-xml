var sys = require('sys');

exports.parseFromString = function(string) {
  
  var document = new Document();
  
  var tokens = tokenize(string);
  
  // process xml declaration and dtd
  processDecs(tokens, document);
  
  //process root node and add it to document
  document.root = new Node(tokens.shift());
  tokens.pop();
  
  var heirarchy = [];
  heirarchy.push(document.root);
  
  while (tokens.length > 0) {
    var textNode = tokens.shift();
    if (textNode[0] == '<') {
      if (textNode[1] == '/') {
        heirarchy.pop();
      } else {
        if (textNode.match(/.*\/>/)) {
          heirarchy.peek().push(new Node(textNode));
        } else {
          var node = new Node(textNode);
          heirarchy.peek().push(node);
          heirarchy.push(node);
        }
      };
    } else {
      heirarchy.peek().push(textNode);
    };
  };
  
  return document;
};

var stripWhitespace = function(string) {
  return string.replace(/\s+</gm, '<').replace(/>\s/gm, '>').
  replace(/\s/gm, ' ');
};

var tokenize = exports.tokenize = function(string) {
  var stream = stripWhitespace(string).split('');
  var tokens = [];
  
  while(stream.length > 0) {
    // while stream not empty
    if(stream[0] == '<') {
      // if this is a tag
      var token = '';
      token += stream.shift();
      //  add characters to the current token until an element stops
      while(stream[0] != '>') {
        token += stream.shift();
      }
      // add closing arrow
      token += stream.shift();
      tokens.push(token);
    } else {
      // if this is a text node
      var token = '';
      token += stream.shift();
      //  add characters to the current token until an element starts
      while(stream[0] != '<') {
        token += stream.shift();
      }
      tokens.push(token);
    }
  }
  
  return tokens;
};

var processDecs = function(tokens, document) {
  // this is an xml declaration
  if(tokens[0][1] === '?') document.xmlDec = tokens.shift();
  
  // this is a DTD
  if(tokens[0][1] === '!') document.docType = tokens.shift();
};

var Document = exports.document = function() {};
Document.prototype.hasCSS = function(selector) {
  var tokens = selector.split(' ');
  var elements = this.root.children(tokens.shift());
  while (tokens.length > 0) {
    var token = tokens.shift();
    var matches = [];
    for (var e=0; e < elements.length; e++) {
      var children = elements[e].children(token);
      for (var i=0; i < children.length; i++) {
        matches.push(children[i]);
      }
    }
    elements = matches;
  }
  return (elements.length > 0 ? true: false);
};

var Node = exports.node = function(string) {
  Array.call(this);
  // parse the node into tag and attribute string
  var terms = string.match(/<(\S+?)(?:\s(.*"))?(?:\s\/)?>/);
  this.tag = terms[1];
  var attrString = terms[2];
  if (attrString) {
    // split the attribute string up
    var attrs = attrString.match(/\S*?=".*?"/);
    for (var i=0; i < attrs.length; i+=2) {
      // for each attribute assign the value to the node underneath the 
      // corresponding key
      var pair = attrs[i].match(/(\S*)="(.*)"/);
      this[pair[1]] = pair[2];
    }
  }
};
exports.node.prototype = Object.create(Array.prototype);
exports.node.prototype.matchCSS = function(selector) {
  var tokens, tag, classes, token, matches = 0;
  if (selector[0] === '#') {
    // search by id
    return this.id === selector.slice(1);
  } else {
    // search by tag and class
    tokens = selector.split('.');
    tag = tokens.shift();
    if (tag !== '') {
      // the first token is a tag
      if (tag !== this.tag) return false;
    }
    if (tokens.length > 0 && !this['class']) return false;
    if (this['class']) classes = this['class'].split(/\s/);
    
    for (var t=0; t < tokens.length; t++) {
      for (var c=0; c < classes.length; c++) {
        if (classes[c] === tokens[t]) {
          matches++;
        }
      }
    }
    if (tokens.length === matches) return true;
  }
  return false;
};
exports.node.prototype.all = function() {
  var nodes = [];
  for (var t=0; t < this.length; t++) {
    if (typeof this[t] !== 'string') {
      var children = this[t].all();
      nodes.push(this[t]);
      for (var c=0; c < children.length; c++) {
        nodes.push(children[c]);
      }
    }
  }
  return nodes;
};
exports.node.prototype.children = function(selector) {
  var nodes = this.all();
  nodes = nodes.filter(function(node) {
    return node.matchCSS(selector);
  });
  return nodes;
};

// NATIVE EXTENSION
Array.prototype.peek = function() {
  return this[this.length - 1];
};
