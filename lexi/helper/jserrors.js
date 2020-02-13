var lexi = lexi || {};
lexi.jsErrors = {
  'Unexpected token ILLEGAL': {
    'code': "stamp('",
    'translation': 'This error usually means you forgot a tick mark like <tt>\'</tt> at the end of a line.'
  },

  'Unexpected end of input': {
    'code': "function loop() {",
    'translation': 'This is usually because you need a curly bracket. Did you start part of your code with a <tt>{</tt> and forget to close with a <tt>}</tt>?'
  },

  'Unexpected end of input on last line': {
    'code': "function loop() {",
    'replacementMessage': 'Unexpected end of input.',
    'translation': 'Nice work, just keep typing! The function won\'t work until you get to the closing <tt>}</tt>'
  },

  'ReferenceError: Invalid left-hand side in assignment': {
    'code': "stamp('pie')= explode",
    'translation': 'You can\'t assign a value to a stamp that way.'
  },

  'missing ) after argument list': {
    'code': "stamp(''",
    'translation': 'You are probably missing a closing parenthesis like <tt>)</tt>.'
  },

  'is not defined': {
    'code': "foo.explode()",
    'translation': 'You are trying to do something with a variable that does not exist. You probably have a misspelling.'
  },

  'Unexpected token': {
    'code': "function loop( {",
    'translation': 'This is usually because you accidentally typed an extra character, or maybe you forgot a character in front of it.'
  },

  'Unclosed string': {
    'code': "a = 'unclosed here",
    'translation': 'Did you forget a quotation mark or tick mark, like \' ?'
  },

  'Unrecoverable syntax error': {
    'code': "function foo()\n  a = 5\n}",
    'replacementMessage': 'Syntax error.',
    'translation': 'This is sometimes because you need a curly bracket. Did you forget a <tt>{</tt> or a <tt>}</tt>?'
  },

  "Expected an identifier and instead saw ','.": {
    'code': "stamp('bear',  )",
    'translation': 'When you have a comma, you usually need a number or a word after it.'
  },

  "Expected ')' and instead saw ''.": {
    'code': "stamp('bear',  ,  )",
    'translation': 'When you have a comma, you usually need a number or a word after it.'
  }
};
