/*
 * nexpect-test.js: Tests for the `nexpect` module.
 *
 * (C) 2011, Elijah Insua, Marak Squires, Charlie Robbins.
 *
 */
 
var assert = require('assert'),
    path = require('path'),
    vows = require('vows'),
    spawn = require('child_process').spawn,
    nexpect = require('../lib/nexpect');

function assertSpawn (expect) {
  return {
    topic: function () {
      expect.run(this.callback)
    },
    "should respond with no error": function (err, stdout) {
      assert.isTrue(!err);
      assert.isArray(stdout);
    }
  }
}

function assertError (expect) {
  return {
    topic: function () {
      expect.run(this.callback.bind(this, null))
    },
    "should respond with no error": function (_, err) {
      assert.isObject(err);
      assert.isNotNull(err.message.match(/^Command not found/));
    }
  }
}

vows.describe('nexpect').addBatch({
  "When using the nexpect module": {
    "it should have the correct methods defined": function () {
      assert.isFunction(nexpect.spawn);
      assert.isObject(nexpect.nspawn);
      assert.isFunction(nexpect.nspawn.spawn);
    },
    "spawning": {
      "`echo hello`": assertSpawn(
        nexpect.spawn("echo", ["hello"])
               .expect("hello")
      ),
      "`ls -al /tmp/undefined`": assertSpawn(
        nexpect.spawn("ls -la /tmp/undefined")
               .expect("No such file or directory")
      ),
      "a command that does not exist": assertError(
        nexpect.spawn("idontexist")
               .expect("This will never work")
      ),
      "and using the sendline() method": assertSpawn(
        nexpect.spawn("node")
              .expect(">")
              .sendline("console.log('testing')")
              .expect("testing")
              .sendline("process.exit()")
      ),
      "and using the wait() method": assertSpawn(
        nexpect.spawn(path.join(__dirname, 'fixtures', 'prompt-and-respond'))
               .wait('first')
               .sendline('first-prompt')
               .expect('first-prompt')
               .wait('second')
               .sendline('second-prompt')
               .expect('second-prompt')
      ),
      "when options.stripColors is set": assertSpawn(
        nexpect.spawn(path.join(__dirname, 'fixtures', 'log-colors'), { stripColors: true })
               .wait('second has colors')
               .expect('third has colors')
      ),
      "when options.ignoreCase is set": assertSpawn(
        nexpect.spawn(path.join(__dirname, 'fixtures', 'multiple-cases'), { ignoreCase: true })
               .wait('this has many cases')
               .expect('this also has many cases')
      )
    }
  }
}).export(module);