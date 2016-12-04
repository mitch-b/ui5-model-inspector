sap.ui.define([
  'jquery.sap.global',
  'sap/ui/base/Object'
], function ($, UI5Object) {
  "use strict";

  var ModelInfo = UI5Object.extend("com.mitchbarry.controls.lib.ModelInfo", {

    _Info: {
      ModelName: '',
      DisplayName: '',
      Model: null,
      IconUri: '',
      ClassName: ''
    },

    constructor: function () {
      
    },

    setModelName: function (sModelName) {
      this._Info.ModelName = sModelName;
    },

    getModelName: function () {
      return this._Info.ModelName;
    },

    setDisplayName: function (sDisplayName) {
      this._Info.DisplayName = sDisplayName;
    },

    getDisplayName: function () {
      return this._Info.DisplayName;
    },

    setClassName: function (sClassName) {
      this._Info.ClassName = sClassName;
    },

    getClassName: function () {
      return this._Info.ClassName;
    },

    setModel: function (oModel) {
      this._Info.Model = oModel;
    },

    getModel: function () {
      return this._Info.Model;
    },

    setIconUri: function (sIconUri) {
      this._Info.IconUri = sIconUri;
    },

    getIconUri: function () {
      return this._Info.IconUri;
    }

  });

  return ModelInfo;
});