"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _css = _interopRequireDefault(require("css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var VuestPlugin = {
  install: function install(Vue) {
    Vue.prototype.$updateDynamicCss = function () {
      var _this = this;

      // data can only be injected into scoped css
      if (this.$options._scopeId) {
        (function () {
          var styleTags = document.querySelectorAll('style');
          var styleReferences = {};

          for (var i = 0; i < styleTags.length; i++) {
            var styleTag = styleTags[i]; // looking for the scoped styles of the component

            if (_css["default"].parse(styleTag.innerText).stylesheet.rules[0].selectors[0].endsWith("[".concat(_this.$options._scopeId, "]"))) {
              // iterating over css rules and storing rules containing references to component's data
              var _iterator = _createForOfIteratorHelper(_css["default"].parse(styleTag.innerText).stylesheet.rules),
                  _step;

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var rule = _step.value;

                  if (rule.type === 'rule') {
                    var _iterator2 = _createForOfIteratorHelper(rule.declarations),
                        _step2;

                    try {
                      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                        var declaration = _step2.value;

                        if (RegExp(/"{{.*}}"/).test(declaration.value)) {
                          var isPresentedInModel = false;

                          var _iterator3 = _createForOfIteratorHelper(Object.keys(_this.$data).concat(Object.keys(_this.$options.computed))),
                              _step3;

                          try {
                            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                              var componentVal = _step3.value;

                              if (RegExp("\"{{".concat(componentVal, "}}\"")).test(declaration.value)) {
                                isPresentedInModel = true;
                                var selector = rule.selectors[0]; // store found selectors to data-reference map

                                styleReferences[componentVal] = styleReferences[componentVal] || {};
                                styleReferences[componentVal][i] = styleReferences[componentVal][i] || {};
                                styleReferences[componentVal][i][selector] = styleReferences[componentVal][i][selector] || {};
                                styleReferences[componentVal][i][selector][declaration.property] = declaration.value;
                              }
                            }
                          } catch (err) {
                            _iterator3.e(err);
                          } finally {
                            _iterator3.f();
                          }

                          if (!isPresentedInModel) {
                            var value = declaration.value.match(/{{(.*)}}/)[1];
                            throw new Error("Value \"".concat(value, "\" is not defined on the instance but referenced in scoped css"));
                          }
                        }
                      }
                    } catch (err) {
                      _iterator2.e(err);
                    } finally {
                      _iterator2.f();
                    }
                  }
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            }
          } // adding watchers to referred data


          var _loop = function _loop() {
            var reference = _Object$keys[_i];

            _this.$watch(reference, function (newValue) {
              for (var _i2 = 0, _Object$keys2 = Object.keys(styleReferences[reference]); _i2 < _Object$keys2.length; _i2++) {
                var styleTagIdx = _Object$keys2[_i2];

                var _loop2 = function _loop2() {
                  var rule = _Object$keys3[_i3];

                  var cssRuleLink = _toConsumableArray(styleTags[styleTagIdx].sheet.cssRules).find(function (r) {
                    return r.selectorText === rule;
                  });

                  var ruleLink = _toConsumableArray(styleTags[styleTagIdx].sheet.rules).find(function (r) {
                    return r.selectorText === rule;
                  });

                  for (var _i4 = 0, _Object$keys4 = Object.keys(styleReferences[reference][styleTagIdx][rule]); _i4 < _Object$keys4.length; _i4++) {
                    var property = _Object$keys4[_i4];
                    var oldPropertyValue = styleReferences[reference][styleTagIdx][rule][property];
                    var newPropertyValue = oldPropertyValue.replaceAll("\"{{".concat(reference, "}}\""), newValue);
                    cssRuleLink.style[property] = newPropertyValue; // for IE

                    ruleLink.style[property] = newPropertyValue;
                  }
                };

                for (var _i3 = 0, _Object$keys3 = Object.keys(styleReferences[reference][styleTagIdx]); _i3 < _Object$keys3.length; _i3++) {
                  _loop2();
                }
              }
            }, {
              immediate: true
            });
          };

          for (var _i = 0, _Object$keys = Object.keys(styleReferences); _i < _Object$keys.length; _i++) {
            _loop();
          }
        })();
      }
    };

    Vue.mixin({
      created: function created() {
        var _this2 = this;

        this.$updateDynamicCss();

        if (module.hot) {
          module.hot.addStatusHandler(function (status) {
            if (status === 'idle') _this2.$updateDynamicCss();
          });
        }
      }
    });
  }
};
var _default = VuestPlugin;
exports["default"] = _default;