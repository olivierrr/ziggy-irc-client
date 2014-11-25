
module.exports = function(storage){

  storage = storage || {}

  setStorage = function(plugin, data) {
    storage.setItem(plugin, JSON.stringify(data))
  }

  getStorage = function(plugin) {
    var st
    if(storage.getItem(plugin) == 'undefined') st = null
    else st = JSON.parse(storage.getItem(plugin)) || null
    return st
  }

  updateStorage = function(plugin, callback) {
    var updatedStorage = callback(this.getStorage(plugin))
    this.setStorage(plugin, updatedStorage)
    return updatedStorage
  }

  return {
    setStorage: setStorage,
    getStorage: getStorage,
    updateStorage: updateStorage
  }

}