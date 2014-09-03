#!/usr/bin/env node

var child_process = require('child_process')
  , path = require('path')
  , os = require('os')

var BIN = path.resolve(__dirname, '..', 'node_modules', '.bin', 'nodewebkit')

var lookup = {
    'darwin': osx_launch
  , 'linux': linux_launch
  , 'win32': win_launch
}
  
lookup[os.platform()]()

function win_launch() {
  spawn('node', [BIN])
}

function osx_launch() {
  spawn(BIN, [])
}

function linux_launch() {
  spawn('sudo', ['node', BIN])
}

function spawn() {
  var args = [].slice.call(arguments)

  child_process.spawn.apply(child_process, args.concat({stdio: 'inherit'}))
}
