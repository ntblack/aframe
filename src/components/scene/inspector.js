/* global AFRAME */
var AFRAME_INJECTED = require('../../constants').AFRAME_INJECTED;
var bind = require('../../utils/bind');
var pkg = require('../../../package');
var registerComponent = require('../../core/component').registerComponent;

var INSPECTOR_URL = pkg.homepage + 'releases/' + pkg.version + '/aframe-inspector.min.js';
var LOADING_MESSAGE = 'Loading Inspector';

module.exports.Component = registerComponent('inspector', {
  schema: {
    url: {default: INSPECTOR_URL}
  },

  init: function () {
    this.onKeydown = bind(this.onKeydown, this);
    this.onMessage = bind(this.onMessage, this);
    this.initOverlay();
    window.addEventListener('keydown', this.onKeydown);
    window.addEventListener('message', this.onMessage);
  },

  initOverlay: function () {
    var dotsHTML = '<span class="dots"><span>.</span><span>.</span><span>.</span></span>';
    this.loadingMessageEl = document.createElement('div');
    this.loadingMessageEl.classList.add('a-inspector-loader');
    this.loadingMessageEl.innerHTML = LOADING_MESSAGE + dotsHTML;
  },

  remove: function () {
    this.removeEventListeners();
  },

  /**
   * <ctrl> + <alt> + i keyboard shortcut.
   */
  onKeydown: function (evt) {
    var shortcutPressed = evt.keyCode === 73 && evt.ctrlKey && evt.altKey;
    if (!this.data || !shortcutPressed) { return; }
    this.injectInspector();
  },

  showLoader: function () {
    document.body.appendChild(this.loadingMessageEl);
  },

  hideLoader: function () {
    this.el.removeChild(this.loadingMessageEl);
  },

  /**
   * postMessage. aframe.io uses this to create a button on examples to open Inspector.
   */
  onMessage: function (evt) {
    if (evt.data === 'INJECT_AFRAME_INSPECTOR') { this.injectInspector(); }
  },

  injectInspector: function () {
    var self = this;
    var script;

    if (AFRAME.INSPECTOR || AFRAME.inspectorInjected) { return; }

    this.showLoader();

    // Inject.
    script = document.createElement('script');
    script.src = this.data.url;
    script.setAttribute('data-name', 'aframe-inspector');
    script.setAttribute(AFRAME_INJECTED, '');
    script.onload = function () {
      AFRAME.INSPECTOR.open();
      self.hideLoader();
      self.removeEventListeners();
    };
    document.head.appendChild(script);
    AFRAME.inspectorInjected = true;
  },

  removeEventListeners: function () {
    window.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('message', this.onMessage);
  }
});
