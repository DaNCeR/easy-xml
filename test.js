xml = require('./xml-new');
sys = require('sys');
assert = require('assert');
repl = require('repl');

assert.falsey = function(value, message) {
  assert.equal(false, value, message);
};
assert.truey = assert.ok;

sampleXml = '<?xml version="1.0" encoding="utf-8" ?>\
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" \
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\
<html xmlns="http://www.w3.org/1999/xhtml">\
  <div class="post">#0\
    <div class="title">undefined</div>\
    <div class="message">undefined</div>\
  </div>\
</html>';

parsedXml = xml.parseFromString(sampleXml);

sampleParsedXml = {};
// sampleParsedXml.docType = ;
sampleParsedXml.declaration = '<?xml version="1.0" encoding="utf-8" ?>';
sampleParsedXml.root = [];
sampleParsedXml.root.xmlns = 'http://www.w3.org/1999/xhtml';

var title = [];
title['class'] = 'title';
title.tag = 'div';
title.push('undefined');

var message = [];
message['class'] = 'message';
title.tag = 'div';
message.push('undefined');

var post = [];
post['class'] = 'post';
title.tag = 'div';
post.push('#0');
post.push(title);
post.push(message);

sampleParsedXml.root.push(post);

// sys.debug('parsed: ' + sys.inspect(parsedXml));
// sys.debug(sys.inspect(sampleParsedXml));

assert.strictEqual(parsedXml.docType,
'<!DOCTYPE html PUBLIC \
"-//W3C//DTD XHTML 1.0 Strict//EN" \
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
'doctype does not match');
assert.strictEqual(parsedXml.xmlDec,
'<?xml version="1.0" \
encoding="utf-8" ?>',
'XML declaration does not match');
assert.strictEqual(parsedXml.root.tag, 'html');

var element = new xml.Element('<div />');
sys.puts(sys.inspect(element));
assert.truey(element.matchCSS('div'), 'match css with tag');
assert.falsey(element.matchCSS('div.test'), 'match css with tag and class');
// assert.falsey(element.matchCSS('#test'), 'match css with id');

var element = new xml.Element('<div class="test" />');
assert.truey(element.matchCSS('div'), 'match css with tag');
assert.truey(element.matchCSS('div.test'), 'match css with tag and class');
assert.falsey(element.matchCSS('div.test.test2'),
  'match css with tag and multiple classes');
// assert.falsey(element.matchCSS('#test'), 'match css with id');

var element = new xml.Element('<div id="test" />');
assert.truey(element.matchCSS('div'), 'match css with tag');
assert.falsey(element.matchCSS('div.test'), 'match css with tag and class');
// assert.truey(element.matchCSS('#test'), 'match css with id');

var element = new xml.Element('<div class="test blah" />');
assert.truey(element.matchCSS('div'), 'match css with tag');
assert.truey(element.matchCSS('div.test'), 'match css with tag and class');
assert.truey(element.matchCSS('div.test.blah'),
  'match css with tag and multiple classes');
assert.falsey(element.matchCSS('div.test.test2'),
  'match css with tag and multiple classes');
// assert.falsey(element.matchCSS('#test'), 'match css with id');

// sys.debug(sys.inspect(parsedXml.root.all()));
// 
assert.truey(parsedXml.hasElement('.post .title'), 'nested');
assert.truey(parsedXml.hasElement('.post .message'), 'nested');
assert.falsey(parsedXml.hasElement('.missing'), 'missing');

repl.scope.parsedXml = parsedXml;
repl.scope.sampleParsedXml = sampleParsedXml;
repl.scope.sampleXml = sampleXml;
repl.start("node> ");
