sys: require 'sys'

parseFromString: (xml) ->
  document: new Document()
  tokens: tokenize xml
  
  # this is an xml declaration
  if tokens[0][1] is '?' then document.xmlDec: tokens.shift()
  # this is a DTD
  if tokens[0][1] is '!' then document.docType: tokens.shift()
  
  # process root node and add it to document
  document.root: new Element tokens.shift()
  tokens.pop()
  
  # create heirarchy stack to track what the next tokens parent is
  heirarchy: []
  heirarchy.peek = peek
  # add the root node to the stack
  heirarchy.push document.root
  
  while tokens.length > 0
    # while there are still unprocessed tokens
    token: tokens.shift()
    # if the current token is a tag
    if token[0] is '<'
      # if this is a closing tag
      if token[1] is '/'
        # pop the current tag of the heirarchy
        heirarchy.pop()
      else
        # create an element from the token and add it to its parent
        element: new Element(token)
        sys.debug sys.inspect(heirarchy.peek())
        heirarchy.peek().push element
        # if the element isn't self closing add it to the heirarchy
        if not token.match(/.*\/>/) then heirarchy.push element
    else
      heirarchy.peek().push token
  
  document

stripWhitespace: (string) ->
  return string.
  replace(/\s+</m, '<').
  replace(/>\s+/m, '>').
  replace(/\s+/m, ' ')
  
tokenize: (xml) ->
  # strip whitespace from the xml and convert into an array of characters
  stream: stripWhitespace(xml).split ''
  while stream.length > 0
    token: ''
    token += stream.shift()
    # if the current token is a tag
    if token is '<'
      # add characters to the current token until the element stops
      while stream[0] isnt '>' then token += stream.shift()
      token += stream.shift()
    else
      # add characters to the current token until an element starts
      while stream[0] isnt '<' then token += stream.shift()
      token
      
peek: ->
  this[this.length - 1]

class Document
  getElements: (selector) ->
    tokens: selector.split ' '
    elements: this.root.descendants()
    elements.push this.root
    while tokens.length > 0
      token: tokens.shift()
      matches: []
      for element in elements
        children: element.descendants().filter (element) ->
          return element.matchCSS token
        for child in children
          matches.push child
      elements: matches
    return (if elements.length > 0 then elements else null)
  
  hasElement: (selector) ->
    return !!@getElements(selector)

class Element extends Array
  constructor: (tag) ->
    super()
    # grab the tag name and attributes
    tokens: tag.match /<(\S+?)(?:\s(.*"))?(?:\s\/)?>/
    this.tag: tokens[1]
    if tokens[2]
      # split the attributes up
      attrs: tokens[2].match /\S*?=".*?"/
      for attr in attrs
        # for each attribute assign the value to this element
        pair: attr.match /(\S*)="(.*)"/
        this[pair[1]]: pair[2]
  
  matchCSS: (selector) ->
    # this will split the selector up giving us an array with the tag and
    # all of the classes
    tokens: selector.split '.'
    tag: tokens.shift()
    # if the first token is a tag
    if tag isnt ''
      # return false if it doesn't match this elements tag
      if tag != @tag then return false
    # for each class in the selector
    for token in tokens
      # return false unless this element has the class
      return false unless @hasClass token
    # otherwise return true
    return true
    
  hasClass: (className) ->
    # if this element doesn't have a class return false
    if not @class then return false
    classes: @class.split /\s/
    # return whether element has class
    classes.indexOf(className) isnt -1
      
  descendants: ->
    elements: []
    for child in this
      if typeof child isnt 'string'
        elements.push child
        for descendant in child.descendants()
          elements.push descendant
    return elements
    
    
  
# module API
exports.parseFromString: parseFromString
exports.Element: Element
